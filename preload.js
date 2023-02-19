const fs = require('fs');
const { contextBridge, ipcRenderer } = require('electron');

// expose some backend functions in the frontend
contextBridge.exposeInMainWorld('electron', {
  startScraping() {},
  stopScraping() {},
  path: path.join(__dirname, 'index.css'),
});
