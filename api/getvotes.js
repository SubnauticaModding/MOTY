const auth = require("../src/auth");
const authors = require("../src/authors");
const perms = require("../src/perms");
const users = require("../src/users");

module.exports = function (data) {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession) || !perms.isManager(data.user)) return data.res.sendStatus(403);

    var a = authors.getAuthors();
    var u = users.getUsers();

    var votes = {};

    for (var _a of a) {
      votes[_a.id] = [];
    }
    for (var _u of u) {
      for (var vote of _u.votes) {
        votes[vote].push(_u.id);
      }
    }

    data.res.status(200).send(votes);
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}