let searchResults = [], sortKey = 'downloads', sortDescending = true, selectedResult = null;
const columns = ['name', 'size', 'downloads', 'network', 'channel', 'bot', 'pack'];
const numericColumns = ['size', 'downloads', 'pack'];
function sizeBytes(size) {
  const match = String(size).trim().match(/^([\d.,]+)\s*([KMGTPE]?)(?:i?B)?$/i);
  return match ? Number(match[1].replace(',', '.')) * 1024 ** (' KMGTPE'.indexOf(match[2].toUpperCase() || ' ')) : null;
}
// XDCC.eu reports sizes as "631M" or "3.1G": show them as "631 MB", "3,1 GB".
function displaySize(size, locale) {
  const match = String(size).trim().match(/^([\d.,]+)\s*([KMGTPE]?)(?:i?B)?$/i);
  if (!match) return size;
  const value = Number(match[1].replace(',', '.'));
  return `${value.toLocaleString(locale, { maximumFractionDigits: 1 })} ${match[2].toUpperCase()}B`;
}
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-' + name);
  svg.append(use);
  return svg;
}
function selectResult(result) {
  if (busy) return;
  selectedResult = result;
  $('request').value = result.text;
  document.querySelectorAll('.result-table tbody tr').forEach(row => row.setAttribute('aria-selected', String(row.result === result)));
  showShipment(result);
  setMessage('msg.selected', { name: result.name });
  $('start').focus({ preventScroll: true });
}
function renderResults() {
  const t = i18n.t;
  $('results').replaceChildren();
  if (!searchResults.length) return;
  const table = document.createElement('table'); table.className = 'result-table'; table.setAttribute('aria-label', t('results.caption'));
  const head = table.createTHead().insertRow();
  for (const key of columns) {
    const cell = document.createElement('th'); cell.scope = 'col';
    if (numericColumns.includes(key)) cell.className = 'num';
    const state = key === sortKey ? (sortDescending ? 'descending' : 'ascending') : 'none';
    cell.setAttribute('aria-sort', state);
    const button = document.createElement('button'); button.type = 'button'; button.dataset.sort = key;
    button.title = t(state === 'none' ? 'sort.none' : state === 'descending' ? 'sort.desc' : 'sort.asc');
    button.append(t('col.' + key), icon(state === 'none' ? 'sort' : state === 'descending' ? 'down' : 'up'));
    button.onclick = () => {
      sortDescending = sortKey === key ? !sortDescending : numericColumns.includes(key);
      sortKey = key; const scroll = $('results').scrollTop; renderResults(); $('results').scrollTop = scroll;
      document.querySelector(`[data-sort="${key}"]`).focus({ preventScroll: true });
    };
    cell.append(button); head.append(cell);
  }
  const sorted = [...searchResults].sort((a, b) => {
    const left = sortKey === 'size' ? sizeBytes(a.size) : a[sortKey];
    const right = sortKey === 'size' ? sizeBytes(b.size) : b[sortKey];
    if (left == null) return right == null ? 0 : 1;
    if (right == null) return -1;
    const order = typeof left === 'number' ? left - right : String(left).localeCompare(String(right), i18n.getLanguage(), { numeric: true, sensitivity: 'base' });
    return sortDescending ? -order : order;
  });
  const locale = i18n.getLanguage() === 'it' ? 'it-IT' : 'en-US';
  const body = table.createTBody();
  for (const result of sorted) {
    const row = body.insertRow(); row.className = 'result'; row.result = result; row.tabIndex = 0;
    row.setAttribute('aria-selected', String(result === selectedResult));
    for (const key of columns) {
      const cell = row.insertCell(); cell.className = `col-${key}` + (numericColumns.includes(key) ? ' num' : '');
      const label = key === 'downloads' ? (result.downloads == null ? '—' : result.downloads.toLocaleString(locale)) : key === 'pack' ? '#' + result.pack : key === 'size' ? displaySize(result.size, locale) : result[key];
      if (key === 'downloads' && result.downloads == null) cell.classList.add('missing');
      if (key === 'network') { const tag = document.createElement('span'); tag.className = 'net'; tag.textContent = label; cell.append(tag); }
      else if (key === 'name' && label.length > 28) {
        const wrap = document.createElement('span'); wrap.className = 'name-wrap';
        const head = document.createElement('span'); head.className = 'head'; head.textContent = label.slice(0, -16);
        const tail = document.createElement('span'); tail.className = 'tail'; tail.textContent = label.slice(-16);
        wrap.append(head, tail); cell.append(wrap);
      }
      else cell.textContent = label;
      cell.title = String(label);
    }
    row.onclick = () => selectResult(result);
    row.onkeydown = event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectResult(result); }
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); (event.key === 'ArrowDown' ? row.nextElementSibling : row.previousElementSibling)?.focus(); }
    };
  }
  $('results').append(table);
}
