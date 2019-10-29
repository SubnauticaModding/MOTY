const auth = require("../src/auth");
const server = require("../server");

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      auth.clearCookies(data.res);
      auth.removeToken(data.authUserID);
    }
    data.res.redirect("/");
  } catch (e) {
    console.error(e);
    data.res.redirect("/");
  }
}