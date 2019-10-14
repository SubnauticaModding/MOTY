const path = require("path");
const read = require("fs-readdir-recursive");

module.exports.getAuthor = function (name) {
  return getObject("authors", name);
}

module.exports.getMod = function (name) {
  return getObject("mods", name);
}

module.exports.getUser = function (name) {
  return getObject("users", name);
}

module.exports.getAuthors = function () {
  return getObjects("authors");
};

module.exports.getMods = function () {
  return getObjects("mods");
};

module.exports.getUsers = function () {
  return getObjects("users");
};

module.exports.setAuthor = function (name, data) {
  setObject("authors", name, data);
}

module.exports.setMod = function (name, data) {
  setObject("mods", name, data);
}

module.exports.setUser = function (name, data) {
  setObject("users", name, data);
}

function getObject(folder, file) {
  return fs.readFileSync(path.join(__dirname, "../data/", folder, file + ".json"), 'utf-8');
}

function getObjects(folder) {
  var objs = [];
  
  var p = path.join(__dirname, "../data/", folder);
  var files = read(p).filter(f => f.endsWith(".json"));
  
  for (var f of files) {
    var json = JSON.parse(fs.readFileSync(path.join(p, f)));
    objs.push(json);
  }
  
  return objs;
};

function setObject(folder, file, data) {
  fs.writeFileSync(path.join(__dirname, "../data/", folder, file + ".json"), JSON.stringify(data, 2));
}