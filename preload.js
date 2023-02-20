const fs = require('fs');
const { contextBridge, ipcRenderer } = require('electron');
const { scrape } = require('./src/app');

// expose some backend functions in the frontend
contextBridge.exposeInMainWorld('electron', {
  startScraping() {
    scrape();
  },
  stopScraping() {},
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

// {
//   "name": "upworkscrapperwindows",
//   "version": "1.0.0",
//   "description": "",
//   "main": "main.js",
//   "scripts": {
//     "start:dev": "SET NODE_ENV=development& node index.js",
//     "start": "electron ./"
//   },
//   "keywords": [],
//   "author": "",
//   "license": "ISC",
//   "dependencies": {
//     "dotenv": "^16.0.1",
//     "html-to-text": "^8.2.0",
//     "nodemailer": "^6.7.5",
//     "nodemailer-sendgrid": "^1.0.3",
//     "pug": "^3.0.2",
//     "random-useragent": "^0.5.0",
//     "telegraf": "^4.8.4"
//   },
//   "devDependencies": {
//     "electron": "^23.1.0"
//   }
// }
