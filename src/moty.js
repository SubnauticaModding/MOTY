const path = require("path");
const read = require("fs-readdir-recursive");

const server = require("../server");

module.exports.getAuthors = function () {
  return this.getData("authors");
}

module.exports.getMods = function () {
  return this.getData("mods");
}

module.exports.getUsers = function () {
  return this.getData("users");
}

module.exports.getData = function (folder) {
  var objs = [];
  
  var p = path.join(__dirname, "../data/", folder);
  var files = read(p).filter(f => f.endsWith(".json"));
  
  for (var f of files) {
    var json = JSON.parse(fs.readFileSync(path.join(p, f)));
    objs.push(json);
  }
  
  return objs;
}