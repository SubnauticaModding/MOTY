const data = require("./data");

module.exports.getUser = function (id) {
  return data.getObject("users", id);
};

module.exports.getUsers = function () {
  return data.getObjects("users");
};

module.exports.removeUser = function (id) {
  data.removeObject("users", id);
};

module.exports.setUser = function (id, votes) {
  this.setUserObject({
    id: id,
    votes: votes,
  });
};

module.exports.setUserObject = function (object) {
  data.setObject("users", object.id, object);
}