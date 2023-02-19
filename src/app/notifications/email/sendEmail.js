const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");
const nodemailerSendgrid = require("nodemailer-sendgrid");

exports.sendMail = async function (name, url, toEmail, niche, time) {
  try {
    // const html = pug.render(`./template.pug`, {
    const html = pug.renderFile(`${__dirname}/template.pug`, {
      firstName: name,
      url,
      subject: process.env.EMAIL_SUBJECT,
      niche,
      time,
    });

    const mailOptions = {
      // from: process.env.EMAIL_FROM,
      from: `Azeez The Dev <${process.env.EMAIL_FROM}>`,
      to: toEmail,
      subject: process.env.EMAIL_SUBJECT,
      html,
      text: htmlToText.fromString(html),
    };

    await nodemailer
      .createTransport(
        nodemailerSendgrid({
          apiKey: process.env.SENDGRID_API_KEY,
        })

        //   {
        //   // service: 'SendinBlue',
        //   // service: "gmail",
        //   host: "smtp.gmail.com",
        //   port: 465,
        //   secure: true,
        //   auth: {
        //     type: "OAuth2",
        //     user: process.env.SENDINBLUE_EMAIL,
        //     clientId: process.env.GMAIL_CLIENT_ID,
        //     clientSecret: process.env.GMAIL_CLIENT_SECRET,
        //     refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        //     accessToken: process.env.GMAIL_ACCESS_TOKEN,
        //   },
        // }
      )
      .sendMail(mailOptions);
    console.log(`Email on "${niche}" Niche sent successfully to ${name}`);
  } catch (err) {
    // throw new Error(err)
    console.log("There is an error sending Email", err);
  }
};
