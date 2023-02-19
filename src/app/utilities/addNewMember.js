const fs = require("fs");

const allUsers = JSON.parse(
  fs.readFileSync("./../telegramUsers.json", {
    encoding: "utf8",
    flag: "r",
  })
);

console.log(process.env.name);
console.log(process.env.chatId, typeof process.env.chatId);
console.log(process.env.queryStrings);
const newUSer = {};

///
newUSer[`user${Object.keys(allUsers).length + 1}`] = {
  name: process.env.name,
  chatId: +process.env.chatId,
  queryStrings: [process.env.queryStrings.replace("-", " ")],
  email: process.env.email,
};

Object.assign(allUsers, newUSer);

fs.writeFileSync("./../telegramUsers.json", JSON.stringify(allUsers));

// console.log(allUsers);
console.log("\nDone!!  New User Added");

//  Add new member

//  name=Haastrup chatId=420023991 email= queryStrings=copywriting node addNewMember.js

// "user2": {
//   "name": "Sukurat",
//   "chatId": 1914948617,
//   "queryStrings": ["business writing"]
// },
// "user3": {
//   "name": "Samuel",
//   "chatId": 629864847,
//   "queryStrings": ["fiction"]
// },
// "user4": {
//   "name": "Ashraf",
//   "chatId": null,
//   "queryStrings": ["google sheet"],
//   "email": "ashraf.mjn@gmail.com"
// },
// "user5": {
//   "name": "GhostOfJero",
//   "chatId": 480834765,
//   "queryStrings": ["product flyer"]
// },
// "user6": {
//   "name": "Djoe",
//   "chatId": null,
//   "queryStrings": ["Figma"],
//   "email": "oyedejijohn123@gmail.com"
// },
// "user7": {
//   "name": "Haastrup",
//   "chatId": 420023991,
//   "queryStrings": ["copywriting"],
//   "email": ""
// }
