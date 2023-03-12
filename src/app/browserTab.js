// const puppeteer = require('puppeteer-extra');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { browserLaunchOptions } = require('./utils/browserConfig');
const { pageConfig } = require('./utils/pageConfig');
const pie = require('puppeteer-in-electron');
const { BrowserWindow, app } = require('electron');

exports.browserTab = async function (query) {
  const timeArray = ['second', 'minute'];
  let window;
  try {
    // puppeteer.use(StealthPlugin());

    // const browser = await puppeteer.launch(browserLaunchOptions);

    const browser = await pie.connect(app, puppeteer);

    window = new BrowserWindow();
    // window = new BrowserWindow({ show: false });
    // const url = 'https://upwork.com/';

    // const page = await browser.newPage();
    // const page = (await browser.pages())[0];
    // console.log(page);
    // open a new tab on the browser

    const queryString = query.replaceAll(' ', '%20');

    // await page.goto(
    //   `https://www.upwork.com/nx/jobs/search/?q=${queryString}&sort=recency`,
    //   {
    //     // waituntil: "domcontentloaded",
    //     waitUntil: ['networkidle2', 'domcontentloaded'],
    //     // waitUntil: "load",
    //     timeout: 59000,
    //   }
    // );
    await window.loadURL(
      `https://www.upwork.com/nx/jobs/search/?q=${queryString}&sort=recency`
    );
    const page = await pie.getPage(browser, window);
    await pageConfig(page);

    const dropDownJobId = await page.evaluate(() => {
      const allEls = document.querySelectorAll('.up-card-list-section');
      return Array.from(allEls).map(
        (el) => el.getAttribute('id').split('-')[1]
      );
    });

    const dropDowns = await page.$$('.up-card-list-section');

    let jobIdsAndTimeValueArray = [];

    for (const [i, el] of dropDowns.entries()) {
      await page.waitForSelector(
        `#job-${dropDownJobId[i]} > div.mb-10 > div:nth-child(1) > small > span:nth-child(4) > span > span`,
        {
          visible: true,
          // timeout: 20000,
        }
      );
      const time = await page.$(
        `#job-${dropDownJobId[i]} > div.mb-10 > div:nth-child(1) > small > span:nth-child(4) > span > span`
      );

      let timeValue = await page.evaluate((el) => el.textContent, time);

      // console.log(timeValue);
      const currentEl = await el.$('.job-tile-title');

      const yourHref = await currentEl.$eval('a', (anchor) =>
        anchor.getAttribute('href')
      );
      const jobUniqueId = yourHref.split('~')[1].slice(0, -1);

      jobIdsAndTimeValueArray.push({ timeValue, jobUniqueId });
    }
    jobIdsAndTimeValueArray = jobIdsAndTimeValueArray.filter(
      (obj) =>
        obj.timeValue.includes(timeArray[0]) ||
        obj.timeValue.includes(timeArray[1])
    );
    console.log(jobIdsAndTimeValueArray);

    console.log('Now in browsertab.js');
    window.close();

    return {
      query,
      jobIdsAndTimeValueArray,
    };
  } catch (err) {
    // await page.close();
    console.log(err);
    window.close();

    throw new Error(err.message);
  }
};
