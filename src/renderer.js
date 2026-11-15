const $ = id => document.getElementById(id);
const api = window.downloader;
const format = bytes => (Number(bytes || 0) / 1048576).toLocaleString(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' MB';
const locale = () => (i18n.getLanguage() === 'it' ? 'it-IT' : 'en-US');
let messageKey = null, messageParams = {}, searchDone = false;
let busy = false, state = 'idle', shipment = null, parseTimer = null, received = 0, total = 0, speed = 0;

function storedLanguage() { try { return localStorage.getItem('lang'); } catch { return null; } }
function storeLanguage(lang) { try { localStorage.setItem('lang', lang); } catch { /* private storage unavailable */ } }

function applyLanguage(lang) {
  i18n.setLanguage(lang);
  document.documentElement.lang = i18n.getLanguage();
  document.querySelectorAll('[data-i18n]').forEach(node => { node.textContent = i18n.t(node.dataset.i18n); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => { node.placeholder = i18n.t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-label]').forEach(node => node.setAttribute('aria-label', i18n.t(node.dataset.i18nLabel)));
  document.querySelectorAll('[data-lang]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.lang === i18n.getLanguage())));
  api.setLanguage(i18n.getLanguage());
  $('log').dataset.empty = i18n.t('env.logEmpty');
  if (searchDone) { renderResults(); setSearchStatus(); } else $('search-status').textContent = i18n.t('search.idle');
  if (messageKey) $('message').textContent = i18n.t(messageKey, messageParams);
  showShipment(shipment);
  setState(state, false);
  showFigures();
  if (destinationPath) setDestination(destinationPath);
  checkRequest();
}

function setBusy(value) {
  busy = value;
  for (const id of ['start', 'folder', 'request']) $(id).disabled = value;
  $('cancel').disabled = !value;
}
// Keys are re-translated on a language switch; plain text comes from the main process already translated.
function setMessage(textOrKey, params) {
  messageKey = params !== undefined || /^[a-z]+\.[a-zA-Z]+$/.test(textOrKey) ? textOrKey : null; messageParams = params || {};
  $('message').textContent = messageKey ? i18n.t(messageKey, messageParams) : textOrKey;
  $('message').classList.remove('is-file'); $('message').removeAttribute('title');
}
function setFileMessage(name) { setMessage(name); $('message').classList.add('is-file'); $('message').title = name; }
function log(message) { const node = $('log'); node.textContent = (node.textContent + message + '\n').slice(-25000); node.scrollTop = node.scrollHeight; }

function setState(next, stamp = true) {
  const changed = next !== state;
  state = next;
  $('state').textContent = i18n.t('state.' + next);
  $('state').dataset.state = next;
  const postmark = $('postmark');
  postmark.dataset.state = next;
  $('pm-state').textContent = i18n.t('stamp.' + next);
  const now = new Date();
  $('pm-date').textContent = [now.getDate(), now.getMonth() + 1, now.getFullYear() % 100].map(n => String(n).padStart(2, '0')).join('·');
  if (stamp && changed) { postmark.classList.remove('stamp'); void postmark.offsetWidth; postmark.classList.add('stamp'); }
}

function showShipment(request) {
  shipment = request;
  const file = $('env-file');
  $('waybill').hidden = !request;
  $('env-hint').hidden = !!request;
  if (!request) {
    file.textContent = i18n.t('env.none'); file.classList.add('none'); $('pm-net').textContent = 'XDCC';
    if (!busy && state !== 'idle') resetTransit();
    return;
  }
  file.textContent = request.name || `${request.bot} · #${request.pack}`;
  file.classList.remove('none');
  const from = $('wb-from'); from.replaceChildren(request.bot + ' ');
  const pack = document.createElement('span'); pack.className = 'sub'; pack.textContent = '· ' + i18n.t('env.pack', { pack: request.pack }); from.append(pack);
  const office = $('wb-office'); office.replaceChildren(`${request.host}:${request.port} `);
  const detail = document.createElement('span'); detail.className = 'sub'; detail.textContent = '· ' + request.channel + (request.secure ? ' · ' + i18n.t('env.tls') : ''); office.append(detail);
  $('pm-net').textContent = request.network || request.host.replace(/^irc\./i, '').split('.')[0];
}

function duration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '';
  const s = Math.round(seconds), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return h ? `${h} h ${String(m).padStart(2, '0')} min` : m ? `${m} min ${String(r).padStart(2, '0')} s` : `${r} s`;
}
function showFigures() {
  $('bytes').textContent = total ? `${format(received)} / ${format(total)}` : format(received);
  $('speed').textContent = state === 'downloading' && speed ? format(speed) + '/s' : '';
  const eta = state === 'downloading' && speed && total ? duration((total - received) / speed) : '';
  $('eta').textContent = eta ? i18n.t('env.remaining', { time: eta }) : '';
}
function resetTransit() {
  received = 0; total = 0; speed = 0;
  setProgress(0); $('transit').dataset.idle = 'true';
  setState('idle', false); setMessage('msg.start'); showFigures();
}
function setDestination(path) { $('destination-text').textContent = path; $('destination').title = path; }
function setProgress(percent) {
  $('transit').dataset.idle = 'false';
  const value = Math.min(100, Math.max(0, percent));
  $('strip-fill').style.width = value + '%';
  document.querySelector('.strip').setAttribute('aria-valuenow', value.toFixed(1));
  $('percent').textContent = value.toLocaleString(locale(), { maximumFractionDigits: 1 }) + '%';
}

api.onUpdate(data => {
  if (data.log) log(data.log);
  if (data.state) {
    if (data.state === 'queued' && state === 'downloading') return;
    setState(data.state);
    if (['done', 'error', 'cancelled'].includes(data.state)) { setBusy(false); speed = 0; }
  }
  if (data.message) {
    log(data.message);
    if (data.state === 'done' && data.params?.file) setFileMessage(data.params.file);
    else if (data.key) setMessage(data.key, data.params);
    else if (data.state === 'downloading') setFileMessage(data.message);
    else setMessage(data.message);
  }
  if (Number.isFinite(data.percentage)) setProgress(data.percentage);
  if (data.received !== undefined) { received = data.received; total = data.total || 0; }
  if (data.speed !== undefined) speed = data.speed;
  showFigures();
});

let destinationPath = '';
$('folder').onclick = async () => { destinationPath = await api.folder(); setDestination(destinationPath); };
$('open').onclick = () => api.openFolder();
$('cancel').onclick = () => api.cancel();
$('start').onclick = async () => {
  if (busy) return;
  setBusy(true); setProgress(0); received = 0; total = 0; speed = 0; showFigures(); $('log').textContent = '';
  try {
    const result = await api.start($('request').value);
    if (!result.ok) throw new Error(result.message);
    destinationPath = result.destination; setDestination(destinationPath);
    showShipment({ ...(shipment || {}), ...result.request });
  } catch (error) { setBusy(false); setState('error'); setMessage(error.message); }
};

async function checkRequest() {
  const text = $('request').value;
  const check = $('request-check');
  check.replaceChildren(); check.className = 'check';
  if (!text.trim()) { if (!selectedResult) showShipment(null); return; }
  const result = await api.parse(text);
  if (text !== $('request').value) return;
  check.className = 'check ' + (result.ok ? 'ok' : 'bad');
  check.append(icon(result.ok ? 'check' : 'alert'), result.ok ? i18n.t('manual.valid') : result.message);
  if (!result.ok && !busy) showShipment(null);
  if (result.ok) {
    const same = selectedResult && selectedResult.text === text;
    showShipment(same ? selectedResult : result.request);
  }
}
$('request').addEventListener('input', () => {
  if (selectedResult && selectedResult.text !== $('request').value) {
    selectedResult = null;
    document.querySelectorAll('.result-table tbody tr[aria-selected="true"]').forEach(row => row.setAttribute('aria-selected', 'false'));
  }
  clearTimeout(parseTimer); parseTimer = setTimeout(checkRequest, 200);
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  for (const other of tabs) {
    const active = other === tab;
    other.setAttribute('aria-selected', String(active)); other.tabIndex = active ? 0 : -1;
    $(other.getAttribute('aria-controls')).hidden = !active;
  }
  if (tab.id === 'tab-manual') checkRequest();
}
tabs.forEach((tab, index) => {
  tab.onclick = () => selectTab(tab);
  tab.onkeydown = event => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    const next = tabs[(index + step + tabs.length) % tabs.length]; next.focus(); selectTab(next);
  };
});
document.querySelectorAll('[data-lang]').forEach(button => { button.onclick = () => { storeLanguage(button.dataset.lang); applyLanguage(button.dataset.lang); }; });

let searchCount = 0;
function setSearchStatus() {
  $('search-status').textContent = searchCount
    ? `${i18n.t('search.count', { count: searchCount.toLocaleString(locale()) })}. ${i18n.t('search.hint')}${searchCount >= 500 ? ' ' + i18n.t('search.many') : ''}`
    : i18n.t('search.empty');
}
$('search-form').onsubmit = async event => {
  event.preventDefault();
  selectTab($('tab-search'));
  $('search-button').disabled = true;
  $('query').disabled = true;
  $('search-status').textContent = i18n.t('search.loading');
  $('results').replaceChildren();
  try {
    const response = await api.search($('query').value);
    if (!response.ok) throw new Error(response.message);
    searchResults = response.results; searchCount = searchResults.length; selectedResult = null; searchDone = true;
    setSearchStatus();
    renderResults();
  } catch (error) { $('search-status').textContent = error.message; }
  finally { $('search-button').disabled = false; $('query').disabled = false; }
};

api.destination().then(path => { destinationPath = path; setDestination(path); });
applyLanguage(storedLanguage() || i18n.pick(navigator.language));
setMessage('msg.start');
