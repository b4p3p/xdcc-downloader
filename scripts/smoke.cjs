const { app, ipcMain } = require('electron');
const assert = require('node:assert/strict');
const timer = setTimeout(() => { console.error('Timeout apertura interfaccia'); app.exit(1); }, 15000);
app.on('browser-window-created', (_event, window) => {
  window.webContents.on('did-fail-load', (_event, code, message) => { console.error(code, message); app.exit(1); });
  window.webContents.once('did-finish-load', async () => {
    try {
      const result = await window.webContents.executeJavaScript(`({ title: document.title, start: !!document.getElementById('start'), api: typeof window.downloader?.start, cancelDisabled: document.getElementById('cancel').disabled })`);
      assert.deepEqual(result, { title: 'XDCC Downloader', start: true, api: 'function', cancelDisabled: true });
      ipcMain.removeHandler('search');
      const text = 'Server: irc.example.org\nChannel: #test\nCommand: /msg Bot xdcc send #42';
      ipcMain.handle('search', () => ({ ok: true, results: [
        { name: '<b>File di prova</b>', size: '1M', downloads: 100, network: 'Test', channel: '#test', bot: 'Bot', pack: 42, text },
        { name: 'Altro file', size: '2G', downloads: 9, network: 'Test', channel: '#test', bot: 'Bot', pack: 43, text: 'altro' }
      ] }));
      const selection = await window.webContents.executeJavaScript(`(async () => {
        document.getElementById('query').value = 'prova';
        document.getElementById('search-form').requestSubmit();
        for (let i = 0; i < 100 && !document.querySelector('.result'); i++) await new Promise(resolve => setTimeout(resolve, 20));
        document.querySelector('.result').click();
        const literalName = document.querySelector('.col-name').textContent;
        const htmlInjected = !!document.querySelector('.col-name b');
        const downloadsBefore = document.querySelector('.col-downloads').textContent;
        document.querySelector('[data-sort="downloads"]').click();
        const downloadsAfter = document.querySelector('.col-downloads').textContent;
        document.querySelector('[data-sort="size"]').click();
        const largestSize = document.querySelector('.col-size').textContent;
        return { text: document.getElementById('request').value, literalName, htmlInjected, downloadsBefore, downloadsAfter, largestSize, startEnabled: !document.getElementById('start').disabled };
      })()`);
      assert.deepEqual(selection, { text, literalName: '<b>File di prova</b>', htmlInjected: false, downloadsBefore: '100', downloadsAfter: '9', largestSize: '2 GB', startEnabled: true });
      console.log('Ricerca, selezione e download manuale: OK');
      console.log('Interfaccia e collegamento preload: OK'); clearTimeout(timer); app.quit();
    } catch (error) { console.error(error); app.exit(1); }
  });
});
require('../src/main.js');
