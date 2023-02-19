const path = require("path");
const fs = require("fs");

let upworkSmallDB;

upworkSmallDB = fs
  .readFileSync(path.join(__dirname, "upworkIDs.txt"), {
    encoding: "utf8",
    flag: "r",
  })
  .split("\n");

exports.getIds = () =>
  fs
    .readFileSync(path.join(__dirname, "upworkIDs.txt"), {
      encoding: "utf8",
      flag: "r",
    })
    .split("\n");
