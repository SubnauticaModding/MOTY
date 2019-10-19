const auth = require('../src/auth');
const authors = require('../src/authors');
const server = require('../server');
const users = require('../src/users');

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      data.res.sendStatus(401);
    } else {
      if (!data.req.query.id) {
        data.res.sendStatus(400);
      } else {
        var authors = authors.getAuthors();
      }
    }
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500);
  }
}