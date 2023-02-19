const fs = require('fs');
const path = require('path');
require('dotenv').config();
process.on('SIGTERM', () => {
  console.log('Deleting....');
  deleteIds();

  console.log(`Id's deleted`);
  setTimeout(() => {
    process.exit(1);
  }, 2000);
});

const { browserTab } = require('./browserTab');
const {
  sendMail,
} = require('../../optimizedUpworkScrapperProject/notifications/email/sendEmail');

const {
  getIds,
} = require('../../optimizedUpworkScrapperProject/utilities/checkIfIdExists');
const {
  telegramMessage,
} = require('./notifications/telegram/sendTelegramMessage');

// kill the app
// process.kill(process.pid, "SIGTERM");

async function main() {
  console.log(`Started scraping at: ${new Date()}`);
  const {
    addUniqueId,
    saveIds,
    deleteIds,
  } = require('../../optimizedUpworkScrapperProject/utilities/addUniqueIds');
  let users = JSON.parse(
    fs.readFileSync(path.join(__dirname, '/utilities/telegramUsers.json'), {
      encoding: 'utf8',
      flag: 'r',
    })
  );

  const usersArray = Object.entries(users);
  let nicheArray = usersArray.flatMap((user) => user[1].queryStrings);

  nicheArray = Array.from(new Set(nicheArray));

  // const browser = await puppeteer.launch(browserLaunchOptions);
  let results = (
    await Promise.allSettled(
      // nicheArray.map((queryString) => browserTab(browser, queryString))
      nicheArray.map((queryString, index) => browserTab(queryString, index))
    )
  )
    .filter((promise) => promise.status === 'fulfilled')
    .map((promise) => promise.value);

  const jobIdsFromDBArray = getIds();
  const hasSentTheJobUpdateToUser = (id) => jobIdsFromDBArray.includes(id);
  const filteredResult = results.map((result) => {
    const newResult = result.jobIdsAndTimeValueArray.filter(
      (timeAndIdObject) =>
        !hasSentTheJobUpdateToUser(timeAndIdObject.jobUniqueId)
    );

    return { query: result.query, jobIdsAndTimeValueArray: newResult };
  });

  // console.log(filteredResult, "\n\n\n\n");
  console.log(filteredResult.map((el) => el.jobIdsAndTimeValueArray));

  // return;

  for (let i = 0; i < filteredResult.length; i++) {
    const query = filteredResult[i].query;

    const usersArray = Object.entries(users);

    const newUsers = usersArray
      .filter((user) => user[1].queryStrings.includes(query))
      .map((el) => el[1]);

    const idAndTimeArr = filteredResult[i].jobIdsAndTimeValueArray;
    for (let j = 0; j < idAndTimeArr.length; j++) {
      const { timeValue, jobUniqueId } = idAndTimeArr[j];

      for (k = 0; k < newUsers.length; k++) {
        const url = `${process.env.UPWORK_URL}${jobUniqueId}`;

        if (newUsers[k].chatId && newUsers[k].chatId !== null) {
          telegramMessage(
            newUsers[k].chatId,
            jobUniqueId,
            timeValue,
            newUsers[k].name,
            query
          );
        }

        if (
          newUsers[k].email &&
          newUsers[k].email !== null &&
          newUsers[k].toSendEmail
        ) {
          await sendMail(
            newUsers[k].name,
            url,
            newUsers[k].email,
            query,
            timeValue
          );
        }
      }

      addUniqueId(jobUniqueId);
    }
  }

  saveIds();

  console.log(`Finished Scraping!! at: ${new Date()}`);
}

////////////

///////////////

let myInterval;

const scrape = function () {
  main();
  myInterval = setInterval(() => {
    main();

    // set the time interval for 45 seconds
  }, 1000 * 45);
};

const stopScrape = function () {
  // check if there is a scraping interval going on
  if (myInterval) clearInterval(myInterval);
};

module.exports = { scrape, stopScrape };
