const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('downloader', {
  search: query => ipcRenderer.invoke('search', query),
  folder: () => ipcRenderer.invoke('folder'),
  start: text => ipcRenderer.invoke('start', text),
  cancel: () => ipcRenderer.invoke('cancel'),
  openFolder: () => ipcRenderer.invoke('open-folder'),
  destination: () => ipcRenderer.invoke('destination'),
  parse: text => ipcRenderer.invoke('parse', text),
  setLanguage: lang => ipcRenderer.invoke('set-language', lang),
  onUpdate: callback => ipcRenderer.on('update', (_event, data) => callback(data))
});
