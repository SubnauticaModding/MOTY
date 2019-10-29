const auth = require("../src/auth");
const authors = require("../src/authors");
const users = require("../src/users");

module.exports = function (data) {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401);
    if (!data.req.query.id) return data.res.sendStatus(400);

    var modautors = authors.getAuthors().map(a => a.id);
    if (!modautors.includes(data.req.query.id)) return data.res.sendStatus(404);

    var user = JSON.parse(users.getUser(data.user.user.id));
    if (user.votes.includes(data.req.query.id)) return data.res.sendStatus(304);
    if (user.votes.length == 3) return data.res.sendStatus(406);

    user.votes.push(data.req.query.id);
    users.setUserObject(user);
    data.res.sendStatus(200);
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}