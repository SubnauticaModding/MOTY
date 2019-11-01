const auth = require("../src/auth");

module.exports = function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) { 
      if (!data.user) data.res.redirect("https://discord.gg/UpWuWwq");
      else data.res.redirect("/");
    } else { 
      data.res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=577052606694948885&redirect_uri=https%3A%2F%2Fsn-moty.glitch.me%2Fauth&response_type=code&scope=identify%20email`);
    }
  } catch (e) {
    console.error(e);
    data.res.redirect("/");
  }
}