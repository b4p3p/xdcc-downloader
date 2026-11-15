// Captures the window in its main states with fake data: `electron scripts/screenshots.cjs [outDir]`.
const { app, ipcMain } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const out = path.resolve(process.argv[2] || '.impeccable/review');
fs.mkdirSync(out, { recursive: true });
app.disableHardwareAcceleration();
// Neutral path: the captures end up in the public README.
const DEMO_FOLDER = 'C:\\Users\\demo\\Downloads';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const sample = [
  ['debian-12.7.0-amd64-netinst.iso', '631M', 4812, 'Rizon', '#linux-iso', 'MirrorBot', 12],
  ['debian-12.8.0-amd64-netinst.iso', '660M', 3907, 'Abjects', '#distro', 'ISO|Vault', 207],
  ['debian-12.6.0-arm64-netinst.iso', '512M', 2144, 'Rizon', '#linux-iso', 'MirrorBot', 9],
  ['debian-live-12.8.0-amd64-xfce-with-a-very-long-name-to-check-truncation.iso', '3.1G', 1788, 'Libera', '#isos', 'Shelf-01', 44],
  ['debian-12.8.0-i386-netinst.iso', '602M', 1203, 'Abjects', '#distro', 'ISO|Vault', 208],
  ['debian-12.5.0-amd64-DVD-1.iso', '3.7G', 980, 'Rizon', '#linux-iso', 'MirrorBot', 31],
  ['debian-edu-12.8.0-amd64-netinst.iso', '703M', 402, 'Libera', '#isos', 'Shelf-01', 51],
  ['debian-12.4.0-amd64-netinst.iso', '628M', 377, 'Rizon', '#linux-iso', 'MirrorBot', 7],
  ['debian-12.8.0-s390x-netinst.iso', '489M', null, 'Libera', '#isos', 'Shelf-01', 59]
].map(([name, size, downloads, network, channel, bot, pack]) => {
  const host = `irc.${network.toLowerCase()}.net`;
  return { name, size, downloads, network, channel, bot, pack, host, port: 6667, secure: false, text: `Server: ${host}\nChannel: ${channel}\nCommand: /msg ${bot} xdcc send #${pack}` };
});
app.on('browser-window-created', (_event, window) => {
  window.webContents.once('did-finish-load', async () => {
    const js = code => window.webContents.executeJavaScript(code);
    const shot = async (name, width, height) => {
      window.setContentSize(width, height); await delay(400);
      // CDP capture is steadier than capturePage() on machines with flaky GPU compositing.
      if (!window.webContents.debugger.isAttached()) window.webContents.debugger.attach('1.3');
      const { data } = await window.webContents.debugger.sendCommand('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(out, name + '.png'), Buffer.from(data, 'base64'));
    };
    const send = data => window.webContents.send('update', data);
    try {
      ipcMain.removeHandler('search');
      ipcMain.handle('search', () => ({ ok: true, results: sample }));
      // Drive the real Start path so the busy state is the one users see; no worker is spawned.
      ipcMain.removeHandler('start');
      ipcMain.handle('start', () => ({ ok: true, request: sample[1], destination: DEMO_FOLDER }));

      await js(`localStorage.setItem('lang', 'it'); document.querySelector('[data-lang="it"]').click()`);
      ipcMain.removeHandler('destination');
      ipcMain.handle('destination', () => DEMO_FOLDER);
      await js(`window.downloader.destination().then(path => { destinationPath = path; setDestination(path); })`);
      await shot('idle', 1440, 900);
      await js(`document.getElementById('query').value = 'debian 12 netinst'; document.getElementById('search-form').requestSubmit()`);
      await delay(300);
      await js(`document.querySelectorAll('.result-table tbody tr')[1].click()`);
      await js(`document.getElementById('start').click()`); await delay(200);
      send({ state: 'connecting', key: 'worker.connecting', params: { host: 'irc.abjects.net' }, message: 'Connessione a irc.abjects.net…' });
      send({ log: 'ISO|Vault: Queued, position 2 of 5' });
      send({ state: 'downloading', message: 'debian-12.8.0-amd64-netinst.iso', received: 432013312, total: 692060160, percentage: 62.4, speed: 3984588 });
      await delay(600);
      await shot('desktop', 1440, 900);
      await shot('medium', 1100, 820);
      await shot('narrow', 680, 900);
      send({ state: 'done', key: 'worker.done', params: { file: 'debian-12.8.0-amd64-netinst.iso' }, message: 'Completato: debian-12.8.0-amd64-netinst.iso', percentage: 100, received: 692060160, total: 692060160 });
      await delay(600);
      await shot('done', 1280, 800);
      await js(`document.querySelector('[data-lang="en"]').click()`); await delay(300);
      await shot('done-en', 1280, 800);
      await js(`document.getElementById('tab-manual').click(); document.getElementById('request').value = 'irc://irc.example.net/linux-iso'; document.getElementById('request').dispatchEvent(new Event('input'))`);
      await delay(600);
      await shot('manual-en-error', 1280, 800);
      await js(`document.getElementById('request').value = 'irc://irc.example.net/linux-iso\\n/msg MirrorBot xdcc send #12'; document.getElementById('request').dispatchEvent(new Event('input')); document.getElementById('start').click()`);
      await delay(300);
      send({ state: 'connecting', key: 'worker.connecting', params: { host: 'irc.example.net' }, message: 'Connecting to irc.example.net…' });
      send({ state: 'error', message: 'Transfer interrupted before completion. The partial file is kept.' });
      await delay(500);
      await shot('error-en', 1280, 800);
      await js(`localStorage.setItem('lang', 'it')`);
      console.log('Screenshots in ' + out);
      app.quit();
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../src/main.js');
