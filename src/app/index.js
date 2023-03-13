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

const { getIds } = require('./utils/checkIfIdExists');
// const {
//   telegramMessage,
// } = require('./notifications/telegram/sendTelegramMessage');
const { sendMail } = require('./notifications/email/sendEmail');
const { default: axios } = require('axios');

// kill the app
// process.kill(process.pid, "SIGTERM");

async function appScrape() {
  try {
    console.log(`Started scraping at: ${new Date()}`);
    const { addUniqueId, saveIds, deleteIds } = require('./utils/addUniqueIds');

    let users = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../settings.json'), {
        encoding: 'utf8',
        flag: 'r',
      })
    ).user;
    console.log(users);
    const usersArray = Object.entries(users);
    let nicheArray = users.queryStrings;

    // nicheArray = Array.from(new Set(nicheArray));
    console.log('here', nicheArray);
    // const browser = await puppeteer.launch(browserLaunchOptions);
    let results = (
      await Promise.allSettled(
        // nicheArray.map((queryString) => browserTab(browser, queryString))
        nicheArray.map((queryString, index) => browserTab(queryString))
      )
    )
      .filter((promise) => promise.status === 'fulfilled')
      .map((promise) => promise.value);

    console.log('Now in index.js');
    console.log(results);
    const jobIdsFromDBArray = getIds();
    const hasSentTheJobUpdateToUser = (id) => jobIdsFromDBArray.includes(id);
    const filteredResult = results.map((result) => {
      const newResult = result.jobIdsAndTimeValueArray.filter(
        (timeAndIdObject) =>
          !hasSentTheJobUpdateToUser(timeAndIdObject.jobUniqueId)
      );

      return {
        query: result.query,
        jobIdsAndTimeValueArray: newResult,
        // ...result,
      };
    });

    // console.log(filteredResult, "\n\n\n\n");
    console.log(filteredResult.map((el) => el.jobIdsAndTimeValueArray));

    // return;

    for (let i = 0; i < filteredResult.length; i++) {
      const query = filteredResult[i].query;

      const usersArray = Object.entries(users);

      // const users = users;
      // const users = usersArray
      //   .filter((user) => user[1].queryStrings.includes(query))
      //   .map((el) => el[1]);

      const idAndTimeArr = filteredResult[i].jobIdsAndTimeValueArray;
      console.log(idAndTimeArr);
      for (let j = 0; j < idAndTimeArr.length; j++) {
        const { timeValue, jobUniqueId } = idAndTimeArr[j];

        // for (k = 0; k < users.length; k++) {
        const url = `${process.env.UPWORK_URL}${jobUniqueId}`;

        if (users.chatId) {
          // send telegram message
          console.log('Calling API now...');
          const message = `Hi ${
            users.name
          }, There is a new job update on Upwork on "${users.queryStrings[0].toUpperCase()}" Niche  posted ${timeValue.trim()}!\nThe link to the new job update is ${`https://www.upwork.com/jobs/~${jobUniqueId}`}\n\nPlease make sure you apply early so as to increase your chances of winning the Job!`;
          const res = await axios({
            method: 'POST',
            url: `${process.env.DEVELOPMENT_API_URL}/api/v1/notification`,
            data: {
              telegramId: users.chatId,
              message,
            },
          });
          console.log(res.data);
        }

        if (users.email && users.email !== null && users.toSendEmail) {
          await sendMail(users.name, url, users.email, query, timeValue);
        }
        // }

        addUniqueId(jobUniqueId);
      }
    }

    saveIds();

    console.log(`Finished Scraping!! at: ${new Date()}`);
  } catch (error) {
    console.log(error);
  }
}

module.exports = { appScrape };
