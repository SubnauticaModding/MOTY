const auth = require("../src/auth");
const server = require("../server");

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      if (!data.user) data.res.redirect(process.env.DISCORD_INVITE);
      else data.res.redirect("/");
    } else {
      data.res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${server.bot.user.id}&redirect_uri=https%3A%2F%2F${process.env.PROJECT_DOMAIN}.glitch.me%2Fauth&response_type=code&scope=identify%20email`);
    }
  } catch (e) {
    console.error(e);
    data.res.redirect("/");
  }
}