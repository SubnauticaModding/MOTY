const auth = require("../src/auth");
const server = require("../server");

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      auth.clearCookies(data.res);
      auth.removeToken(data.authUserID);
    }
    if (data.req.query.alert) return data.res.redirect("/?alert=" + data.req.query.alert);
    data.res.redirect("/");
  } catch (e) {
    console.error(e);
    data.res.redirect("/?alert=An unknown error occurred while trying to login. Ping @AlexejheroYTB%231636 about this.");
  }
}