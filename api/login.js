const auth = require("../src/auth");

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) data.res.redirect("/");
    else data.res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=577052606694948885&redirect_uri=https%3A%2F%2Fsn-moty.glitch.me%2Fauth&response_type=code&scope=identify`);
  } catch (e) {
    console.error(e);
    data.res.redirect("/");
  }
}