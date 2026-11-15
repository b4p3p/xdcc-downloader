const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('node:path');
const { parseRequest } = require('./parse');
const { search } = require('./search');
const i18n = require('./i18n');
let searching = false;
let window, destination, worker;
function update(data) { if (window && !window.isDestroyed()) window.webContents.send('update', data); }
function stop() {
  const previous = worker;
  worker = null;
  if (previous) previous.kill();
}
app.whenReady().then(() => {
  destination = app.getPath('downloads');
  i18n.setLanguage(app.getLocale());
  window = new BrowserWindow({ width: 1220, height: 900, minWidth: 660, minHeight: 700, backgroundColor: '#eaf0f8', icon: path.join(__dirname, 'assets', 'icon.ico'), webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true } });
  window.setMenuBarVisibility(false);
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.loadFile(path.join(__dirname, 'index.html'));
});
ipcMain.handle('folder', async () => {
  const result = await dialog.showOpenDialog(window, { defaultPath: destination, properties: ['openDirectory', 'createDirectory'] });
  if (!result.canceled) destination = result.filePaths[0];
  return destination;
});
ipcMain.handle('open-folder', () => shell.openPath(destination));
ipcMain.handle('set-language', (_event, lang) => i18n.setLanguage(lang));
ipcMain.handle('parse', (_event, text) => {
  try { return { ok: true, request: parseRequest(text) }; }
  catch (error) { return { ok: false, message: error.message }; }
});
ipcMain.handle('destination', () => destination);
ipcMain.handle('search', async (_event, query) => {
  if (searching) return { ok: false, message: i18n.t('err.searchBusy') };
  searching = true;
  try { return { ok: true, ...await search(query) }; }
  catch (error) { return { ok: false, message: error.message }; }
  finally { searching = false; }
});
ipcMain.handle('start', async (_event, text) => {
  try {
    if (worker) throw new Error(i18n.t('err.downloadBusy'));
    const request = parseRequest(text);
    // Isolate the library and its network sockets so Cancel closes every transfer.
    const { fork } = require('node:child_process');
    const child = fork(path.join(__dirname, 'worker.js'), [], { env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, stdio: ['ignore', 'ignore', 'pipe', 'ipc'] });
    worker = child;
    child.on('message', data => { if (worker === child) update(data); });
    child.on('error', error => { if (worker === child) { worker = null; update({ state: 'error', message: error.message }); } });
    child.on('exit', code => { if (worker === child) { worker = null; if (code !== 0) update({ state: 'error', message: i18n.t('err.interrupted') }); } });
    child.send({ request, destination, language: i18n.getLanguage() });
    return { ok: true, request, destination };
  } catch (error) { return { ok: false, message: error.message }; }
});
ipcMain.handle('cancel', () => { stop(); update({ state: 'cancelled', message: i18n.t('main.cancelled') }); });
app.on('before-quit', stop);
app.on('window-all-closed', () => app.quit());

