const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseResults, search } = require('../src/search');
const html = `<div class="rescount">1 result</div><table id="table"><tbody><tr><td>Test network</td><td><a data-s="irc.example.org" data-c="#test" data-p="Bot xdcc send #42">Info</a></td><td>Bot</td><td>#42</td><td>1x</td><td>4.2G</td><td>Linux.<span class="hit">ISO</span>&amp;tools</td></tr></tbody></table>`;
test('estrae i risultati e prepara i dati per il downloader manuale', () => {
  const { results } = parseResults(html);
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Linux.ISO&tools');
  assert.equal(results[0].size, '4.2G');
  assert.equal(results[0].bot, 'Bot');
  assert.equal(results[0].pack, 42);
  assert.equal(results[0].downloads, 1);
  assert.equal(results[0].text, 'Server: irc.example.org\nChannel: #test\nCommand: /msg Bot xdcc send #42');
});
test('legge i download come numeri, anche con separatori, e distingue valori mancanti', () => {
  assert.equal(parseResults(html.replace('1x', '1,234x')).results[0].downloads, 1234);
  assert.equal(parseResults(html.replace('1x', '0x')).results[0].downloads, 0);
  assert.equal(parseResults(html.replace('1x', '—')).results[0].downloads, null);
});
test('gestisce risultati vuoti e risposte non riconosciute', () => {
  assert.deepEqual(parseResults('<div class="rescount">No results found</div>').results, []);
  assert.deepEqual(parseResults('<p>No result found!</p>').results, []);
  assert.throws(() => parseResults('<html>Service unavailable</html>'), /non riconosciuta/);
  assert.equal(parseResults(html.replace('Bot xdcc send #42', 'invalid')).results.length, 0);
});
test('codifica la ricerca e gestisce gli errori di rete', async () => {
  const result = await search('linux & tools', async url => {
    assert.equal(url.origin, 'https://www.xdcc.eu');
    assert.equal(url.searchParams.get('searchkey'), 'linux & tools');
    return new Response(html);
  });
  assert.equal(result.results.length, 1);
  await assert.rejects(search('a'), /2 a 200/);
  await assert.rejects(search('linux', async () => new Response('', { status: 503 })), /503/);
  await assert.rejects(search('linux', async () => { throw new Error('offline'); }), /connessione/);
});
