const fs = require('fs');
const { contextBridge, ipcRenderer } = require('electron');

// expose some backend functions in the frontend
contextBridge.exposeInMainWorld('electron', {
  startScraping() {},
  stopScraping() {},
  path: path.join(__dirname, 'index.css'),
  setQueryString(query) {
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

    // check if there are more than one query string
    if (settings.user.queryStrings.length >= 2) return false;
    settings.user.queryStrings = [...settings.user.queryStrings, query];

    fs.writeFileSync('./settings.json', JSON.stringify(settings));

    return true;
  },
  deleteQueryString(query) {
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

    // remove from settings
    settings.user.queryStrings = settings.user.queryStrings.filter(
      (olderQueries) => olderQueries.toLowerCase() !== query.toLowerCase()
    );
    // save the new changes
    fs.writeFileSync('./settings.json', JSON.stringify(settings));
    return true;
  },

  getQeuryStrings() {
    return JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  },
});
