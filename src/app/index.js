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

      const newUsers = users;
      // const newUsers = usersArray
      //   .filter((user) => user[1].queryStrings.includes(query))
      //   .map((el) => el[1]);

      const idAndTimeArr = filteredResult[i].jobIdsAndTimeValueArray;
      for (let j = 0; j < idAndTimeArr.length; j++) {
        const { timeValue, jobUniqueId } = idAndTimeArr[j];

        for (k = 0; k < newUsers.length; k++) {
          const url = `${process.env.UPWORK_URL}${jobUniqueId}`;

          if (newUsers[k].chatId && newUsers[k].chatId !== null) {
            // telegramMessage(
            //   newUsers[k].chatId,
            //   jobUniqueId,
            //   timeValue,
            //   newUsers[k].name,
            //   query
            // );
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
  } catch (error) {
    console.log(error);
  }
}

module.exports = { appScrape };
