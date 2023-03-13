const fs = require('fs');
const {
  app,
  BrowserWindow,
  contextBridge,
  ipcRenderer,
  webContents,
} = require('electron');
const { main } = require('./src/app');
const { default: axios } = require('axios');
const path = require('path');

// const { scrape } = require('./src/app');

// expose some backend functions in the frontend
let scrapingStarted = false;
contextBridge.exposeInMainWorld('electron', {
  /**
   * @param {*} func
   * @returns
   * To start scraping call startScraping('scrape) like this in the frontend
   */
  startScraping: (func) => {
    // Check if scrapping has started before starting another one
    if (!scrapingStarted) {
      ipcRenderer.send('electron-func', func);
      scrapingStarted = true;
      return 'Successfully started scrapping!';
    }
  },
  /**
   * @param {*} func
   *  To stop all scraping call stopAllScraping('stopAllScraping) like this in the frontend
   */
  stopAllScraping(func) {
    ipcRenderer.send('electron-func', func);
    scrapingStarted = false;
  },
  async getVersion() {
    try {
      const baseUrl =
        process.env.NODE_ENV === 'development'
          ? process.env.DEVELOPMENT_API_URL
          : process.env.PRODUCTION_API_URL;
      await axios.get(`${baseUrl}/`);
    } catch (error) {}
  },
  updadeQueryString(query) {
    const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));

    // check if there are more than one query string
    if (settings.user.queryStrings.length >= 2) return false;
    settings.user.queryStrings[0] = query;

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

  getUserSettings() {
    return JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  },

  // getUserSettings() {
  //   return JSON.parse(fs.readFileSync('./settings.json', 'utf-8'));
  // },
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
