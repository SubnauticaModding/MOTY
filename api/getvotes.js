const moment = require("moment-timezone");

const auth = require("../src/auth");
const authors = require("../src/authors");
const perms = require("../src/perms");
const users = require("../src/users");

module.exports = function (data) {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401);
    if (data.req.query.rankings) {
      if (!perms.isManager(data.user) && new Date(Date.now()) < moment("2020-01-01T00:00:00Z").tz("UTC")._d) {
        return data.res.sendStatus(403);
      }
    } else {
      if (!perms.isManager(data.user)) {
        return data.res.sendStatus(403);
      }
    }

    var a = authors.getAuthors();
    var u = users.getUsers();

    var votes = {};

    for (var _a of a) {
      votes[_a.id] = [];
    }
    for (var _u of u) {
      for (var vote of _u.votes) {
        votes[vote].push(_u.id);
        if (perms.isStaffID(_u.id)) {
          for (var i = 1; i < process.env.STAFF_VOTE_MULTIPLIER; i++) votes[vote].push(_u.id);
        }
      }
    }

    if (data.req.query.rankings) {
      var top = [];
      var count = [];
      for (var author in votes) {
        if (!top[0] || count[0] < votes[author].length) {
          top[2] = top[1];
          top[1] = top[0];
          top[0] = author;
          count[2] = count[1];
          count[1] = count[0];
          count[0] = votes[author].length;
        } else if (!top[1] || count[1] < votes[author].length) {
          top[2] = top[1];
          top[1] = author;
          count[2] = count[1];
          count[1] = votes[author].length;
        } else if (!top[2] || count[2] < votes[author].length) {
          top[2] = author;
          count[2] = votes[author].length;
        }
      }

      data.res.status(200).send(top);
    } else {
      data.res.status(200).send(votes);
    }
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}