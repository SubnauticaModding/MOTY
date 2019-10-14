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
  data.setObject("mods", id, {
    id: id,
    domain: domain,
    nexusid: nexusID,
    authors: authors,
  });
};