const data = require("./data");

module.exports.getAuthor = function (id) {
  return data.getObject("authors", id);
};

module.exports.getAuthors = function () {
  return data.getObjects("authors");
};

module.exports.removeAuthor = function (id) {
  data.removeObject("authors", id);
};

module.exports.setAuthor = function (id, discordIDs, name, icon) {
  this.setAuthorObject({
    id: id,
    discordids: discordIDs,
    name: name,
    icon: icon,
  });
};

module.exports.setAuthorObject = function (object) {
  data.setObject("authors", object.id, object);
}