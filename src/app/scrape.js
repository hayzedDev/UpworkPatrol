const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { browserConfig } = require('./utils/browserConfig');
const { pageConfig } = require('./utils/pageConfig');

exports.browserTab = async function (query) {
  const timeArray = ['second', 'minute'];
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch(browserConfig);

  // const page = await browser.newPage();
  const page = (await browser.pages())[0];
  try {
    await pageConfig(page);
    // open a new tab on the browser
    // await page.setUserAgent(
    // "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36"
    // );
    // await page.setViewport({ width: 1366, height: 768 });

    // await page.setJavaScriptEnabled(true);

    // Create raw protocol session.
    // const session = await page.target().createCDPSession();
    // const { windowId } = await session.send("Browser.getWindowForTarget");

    // Minimize browser
    // await session.send("Browser.setWindowBounds", {
    //   windowId,
    //   bounds: { windowState: "minimized" },
    // });

    // google%20sheet

    const queryString = query.replaceAll(' ', '%20');

    await page.goto(
      `https://www.upwork.com/nx/jobs/search/?q=${queryString}&sort=recency`,
      {
        // waituntil: "domcontentloaded",
        waitUntil: ['networkidle2', 'domcontentloaded'],
        // waitUntil: "load",
        timeout: 59000,
      }
    );
    // if (index > 4) await page.screenshot({ path: `aa${index}.png` });
    // await page.addStyleTag({ content: "{scroll-behavior: auto !important;}" });

    // await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
    // await page.solveRecaptchas();
    // console.log("Captchas solved");

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

    await browser.close();
    return {
      query,
      jobIdsAndTimeValueArray,
    };
  } catch (err) {
    // await page.close();
    console.log(err);
    await browser.close();

    throw new Error(err.message);
  }
};
