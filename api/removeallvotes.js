const auth = require("../src/auth");
const perms = require("../src/perms");
const users = require("../src/users");

module.exports = function (data) {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession) || !perms.isAdmin(data.user)) return data.res.sendStatus(403);

    var u = users.getUsers();

    for (var _u of u) {
      _u.votes = [];
      users.setUserObject(_u);
    }

    data.res.sendStatus(200);
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}