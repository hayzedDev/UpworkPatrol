const path = require('path');

exports.browserLaunchOptions = {
  // product: "firefox",
  product: 'chrome',
  ignoreHTTPSErrors: true, //prevent chrome is being controlled by automation test software
  args: [
    '--disable-client-side-phishing-detection',
    '--disable-popup-blocking',
    '--expose-internals-for-testing',
    '--disable-infobars',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--single-process',
    '--no-zygote',
    // `--proxy-server=${proxyFetch(index)}`,
  ],
  ignoreDefaultArgs: ['--mute-audio', '--enable-automation'],
  executablePath: path.join(
    __dirname,
    '..',
    '..',
    '..',
    `.cache\puppeteer\chrome\win64-1095492\chrome-win\chrome.exe`
  ),

  headless: false,
};
