const path = require("path");

const fs = require("fs");

let upworkSmallDB;

upworkSmallDB = fs
  .readFileSync(path.join(__dirname, "upworkIDs.txt"), {
    encoding: "utf8",
    flag: "r",
  })
  .split("\n");

exports.addUniqueId = function (jobUniqueId) {
  upworkSmallDB.push(jobUniqueId);
};

exports.saveIds = function () {
  fs.writeFileSync(
    path.join(__dirname, "upworkIDs.txt"),
    upworkSmallDB.join("\n")
  );
};

exports.deleteIds = function () {
  upworkSmallDB = fs
    .readFileSync(path.join(__dirname, "upworkIDs.txt"), {
      encoding: "utf8",
      flag: "r",
    })
    .split("\n");
  const maxvalue = 200;
  if (upworkSmallDB.length > maxvalue)
    fs.writeFileSync(
      path.join(__dirname, "upworkIDs.txt"),
      upworkSmallDB.slice(upworkSmallDB.length - maxvalue).join("\n")
    );
};
