const moment = require("moment-timezone");

const auth = require("../src/auth");
const perms = require("../src/perms");
const server = require("../server");
const users = require("../src/users");

module.exports = function (data) {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401);
    if (!data.req.query.id) return data.res.sendStatus(400);
    
    if (new Date(Date.now()) > moment("2019-12-31T00:00:00Z").tz("UTC")._d && !perms.isAdmin(data.user)) return data.res.sendStatus(410);

    var user = users.getUser(data.user.user.id);
    if (!user.votes.includes(data.req.query.id)) return data.res.sendStatus(409);

    user.votes = user.votes.filter(v => v != data.req.query.id);
    users.setUserObject(user);
    data.res.sendStatus(200);
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}