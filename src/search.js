const { load } = require('cheerio');
const { parseRequest } = require('./parse');
const { t } = require('./i18n');
const { version } = require('../package.json');
const USER_AGENT = `XDCC-Downloader/${version}`;

function parseResults(html) {
  const $ = load(html);
  const results = [];
  $('#table tbody tr').each((_index, row) => {
    const cells = $(row).children('td');
    const info = $(row).find('[data-s][data-c][data-p]').first();
    if (cells.length < 7 || !info.length) return;
    const text = `Server: ${info.attr('data-s')}\nChannel: ${info.attr('data-c')}\nCommand: /msg ${info.attr('data-p')}`;
    try {
      const request = parseRequest(text);
      const gets = cells.eq(4).text().trim().replace(/x$/i, '').replace(/[.,\s]/g, '');
      const downloads = /^\d+$/.test(gets) && Number.isSafeInteger(Number(gets)) ? Number(gets) : null;
      results.push({ name: cells.eq(6).text().trim(), size: cells.eq(5).text().trim(), downloads, network: cells.eq(0).text().trim(), ...request, text });
    } catch { /* Ignore incomplete or malformed records from the remote page. */ }
  });
  const summary = $('.rescount').text().trim();
  if (!$('#table').length && !/0 results|no results?\b|nothing found|no packs|not found/i.test(summary + ' ' + $('body').text())) {
    throw new Error(t('err.unrecognized'));
  }
  return { results, summary };
}

async function search(query, fetcher = fetch) {
  if (typeof query !== 'string' || query.trim().length < 2 || query.trim().length > 200) throw new Error(t('err.query'));
  const url = new URL('https://www.xdcc.eu/search.php');
  url.searchParams.set('searchkey', query.trim());
  let response;
  try { response = await fetcher(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(20000), redirect: 'error' }); }
  catch { throw new Error(t('err.offline')); }
  if (!response.ok) throw new Error(t('err.http', { status: response.status }));
  // Bound memory use even if the remote server returns an unexpected response.
  const chunks = []; let length = 0;
  for await (const chunk of response.body) {
    length += chunk.length;
    if (length > 8 * 1024 * 1024) throw new Error(t('err.tooBig'));
    chunks.push(Buffer.from(chunk));
  }
  return parseResults(Buffer.concat(chunks).toString('utf8'));
}
module.exports = { search, parseResults };
