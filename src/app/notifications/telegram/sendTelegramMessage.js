const { Telegraf } = require('telegraf');

let bot;
/**
 *
 * @param {*} chatId
 * @param {*} jobUniqueId
 * @param {*} time
 * @param {*} name
 * @param {*} niche
 * @returns {void}
 *
 */
const telegramMessage = async function (
  chatId,
  jobUniqueId,
  time,
  name,
  niche
) {
  try {
    bot = new Telegraf(process.env.BOT_TOKEN);
    if (process.env.NODE_ENV === 'production') {
      const API_TOKEN = process.env.API_TOKEN || '';
      const PORT = process.env.PORT || 3000;
      const URL = process.env.URL || 'https://your-heroku-app.herokuapp.com';
      bot = new Telegraf(process.env.BOT_TOKEN);

      bot.telegram.setWebhook(`${URL}/bot${process.env.BOT_TOKEN}`);
      bot.startWebhook(`/bot${process.env.BOT_TOKEN}`, null, PORT);
      // bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
      // bot.startWebhook(`/bot${API_TOKEN}`, null, PORT);
    }
    console.log(bot.isPolling(), 'here');
    if (bot.isPolling()) {
      await bot.stopPolling();
    }

    await bot.startPolling();

    // await bot.stopPolling();

    const message = `Hi ${name}, There is a new job update on Upwork on "${niche.toUpperCase()}" Niche  posted ${time.trim()}!\nThe link to the new job update is ${`https://www.upwork.com/jobs/~${jobUniqueId}`}\n\nPlease make sure you apply early so as to increase your chances of winning the Job!`;

    // const chatId = process.env.currentChatId;
    // send message
    bot.telegram.sendMessage(chatId, message);
    console.log(`Message sent successfully to ${chatId}`);
  } catch (error) {
    console.log(error);
  }
};

// exports.telegramMessage = telegramMessage;

bot ? bot.launch() : '';
console.log('Bot connected Successfully');
