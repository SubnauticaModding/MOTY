const fs = require("fs");
const path = require("path");

module.exports.getAuthors = function () {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data/nexus.json")));
}