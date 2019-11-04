 const data = require("./data");

module.exports.getMod = function (id) {
  return data.getObject("mods", id);
};

module.exports.getMods = function () {
  return data.getObjects("mods");
};

module.exports.removeMod = function (id) {
  data.removeObject("mods", id);
};

module.exports.setMod = function (id, domain, nexusID, authors) {
  this.setModObject({
    id: id,
    domain: domain,
    nexusid: nexusID,
    authors: authors,
  });
};

module.exports.setModObject = function (object) {
  data.setObject("mods", object.id, object);
}