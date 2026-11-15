const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseRequest } = require('../src/parse');
test('riconosce il formato copiato con Server, Channel e Command', () => {
  const input = 'Server: irc.example.net\nChannel: #linux-iso\nCommand: /msg MirrorBot xdcc send #12';
  assert.deepEqual(parseRequest(input), { host: 'irc.example.net', port: 6667, secure: false, channel: '#linux-iso', bot: 'MirrorBot', pack: 12 });
  assert.deepEqual(parseRequest(input.replaceAll('\n', '\r\n')), parseRequest(input));
});
test('riconosce etichette senza distinzione maiuscole e porta TLS', () => {
  const result = parseRequest('command: /MSG Bot XDCC SEND 12\nchannel: test\nserver: ircs://example.org:7000');
  assert.equal(result.port, 7000); assert.equal(result.secure, true); assert.equal(result.channel, '#test');
});
test('riconosce i dati forniti e il canale con cancelletto', () => {
  for (const channel of ['linux-iso', '#linux-iso', '%23linux-iso']) {
    assert.deepEqual(parseRequest(`irc://irc.example.net/${channel}\n/msg MirrorBot xdcc send #12`), { host: 'irc.example.net', port: 6667, secure: false, channel: '#linux-iso', bot: 'MirrorBot', pack: 12 });
  }
});
test('supporta TLS, porta esplicita e comandi maiuscoli', () => {
  const result = parseRequest('ircs://example.org:7000/test\n/MSG Bot XDCC SEND 12');
  assert.equal(result.port, 7000); assert.equal(result.secure, true); assert.equal(result.pack, 12);
});
test('rifiuta richieste incomplete o malformate', () => {
  for (const input of ['', '/msg Bot xdcc send #3', 'irc://example.org/test\n/msg Bot xdcc send #0', 'irc://example.org/a%0Ab\n/msg Bot xdcc send #3']) assert.throws(() => parseRequest(input));
});
test('dice cosa manca in una richiesta incompleta, in italiano e in inglese', () => {
  const i18n = require('../src/i18n');
  assert.throws(() => parseRequest('irc://irc.example.net/linux-iso'), /comando XDCC/);
  assert.throws(() => parseRequest('/msg Bot xdcc send #3'), /Manca il server/);
  i18n.setLanguage('en');
  try { assert.throws(() => parseRequest('irc://irc.example.net/linux-iso'), /XDCC command is missing/); }
  finally { i18n.setLanguage('it'); }
});
