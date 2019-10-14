const data = require("./data");

module.exports.addAuthor = function (id, discordIDs, name, icon) {
  data.setAuthor(id, {
    ids: discordIDs,
    name: name,
    icon: icon,
  });
}

module.exports.removeAuthor = function (id) {
  
}