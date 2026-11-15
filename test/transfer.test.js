const { test } = require('node:test');
const assert = require('node:assert/strict');
const net = require('node:net');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { fork } = require('node:child_process');

for (const truncated of [false, true]) test(truncated ? 'segnala un trasferimento troncato senza dichiararlo completo' : 'scarica un file da un server IRC e bot DCC locali', { timeout: 20000 }, async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'xdcc-downloader-test-'));
  const payload = Buffer.from('Prova trasferimento XDCC Downloader\n'.repeat(2048));
  const sockets = new Set();
  function track(socket) { sockets.add(socket); socket.on('close', () => sockets.delete(socket)); socket.on('error', () => {}); }
  const dcc = net.createServer(socket => { track(socket); socket.end(payload); });
  const lines = [];
  const irc = net.createServer(socket => {
    track(socket);
    let buffer = '', nick = '', welcomed = false;
    socket.on('data', data => {
      buffer += data;
      while (buffer.includes('\n')) {
        const index = buffer.indexOf('\n');
        const line = buffer.slice(0, index).trim(); buffer = buffer.slice(index + 1); lines.push(line);
        const write = text => socket.write(text + '\r\n');
        if (line.startsWith('CAP LS')) write(':local CAP * LS :');
        if (line.startsWith('NICK ')) nick = line.slice(5);
        if (line.startsWith('USER ') && !welcomed) { welcomed = true; write(`:local 001 ${nick} :Welcome`); write(`:local 376 ${nick} :End of MOTD`); }
        if (line.startsWith('JOIN ')) write(`:${nick}!user@localhost JOIN :#test`);
        if (/PRIVMSG TestBot :?xdcc send 1$/i.test(line)) write(`:TestBot!bot@localhost PRIVMSG ${nick} :\x01DCC SEND test.txt 2130706433 ${dcc.address().port} ${payload.length + (truncated ? 100 : 0)}\x01`);
        if (line.startsWith('QUIT')) socket.end();
      }
    });
  });
  await new Promise(resolve => dcc.listen(0, '127.0.0.1', resolve));
  await new Promise(resolve => irc.listen(0, '127.0.0.1', resolve));
  const child = fork(process.env.IRC_TEST_WORKER || path.join(__dirname, '../src/worker.js'), { silent: true, execArgv: [], execPath: process.env.IRC_TEST_EXECUTABLE || process.execPath, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' } });
  t.after(async () => { child.kill(); for (const socket of sockets) socket.destroy(); irc.close(); dcc.close(); await fs.rm(directory, { recursive: true, force: true }); });
  const updates = [];
  let stderr = ''; child.stderr.on('data', data => { stderr += data; });
  const terminal = new Promise((resolve, reject) => {
    child.on('message', data => { updates.push(data); if (['done', 'error'].includes(data.state)) resolve(data); });
    child.on('exit', () => { if (!updates.some(data => ['done', 'error'].includes(data.state))) reject(new Error(stderr || JSON.stringify({ updates, lines }))); });
  });
  child.send({ request: { host: '127.0.0.1', port: irc.address().port, secure: false, channel: '#test', bot: 'TestBot', pack: 1 }, destination: directory });
  const result = await terminal;
  assert.equal(result.state, truncated ? 'error' : 'done', JSON.stringify({ result, updates, lines }));
  // Completion must mean bytes have reached the destination, not just the socket.
  await new Promise(resolve => child.once('exit', resolve));
  assert.deepEqual(await fs.readFile(path.join(directory, 'test.txt')), payload);
  assert.ok(lines.some(line => line.startsWith('JOIN #test')));
});
