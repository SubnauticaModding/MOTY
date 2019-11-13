const querystring = require("querystring");
const request = require("request-promise");

const auth = require("../src/auth");
const discord = require("../src/discord");
const server = require("../server");
const users = require("../src/users");

module.exports = async function (data) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      if (!data.user) return data.res.redirect(process.env.DISCORD_INVITE);
      return data.res.redirect("/");
    }

    if (!data.req.query.code) return data.res.redirect("/?alert=Invalid authentication code. Ping @AlexejheroYTB%231636 about this.");
    
    if (data.req.query.stop) return data.res.sendStatus(204);

    var response = await request.post({
      uri: "https://discordapp.com/api/oauth2/token",
      body: querystring.stringify({
        "client_id": server.bot.user.id,
        "client_secret": process.env.DISCORD_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": `https://${process.env.PROJECT_DOMAIN}.glitch.me/auth`,
        "scope": "identify email",
        "code": data.req.query.code,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
    });
    response = JSON.parse(response);

    var userData = await auth.getUserData(response.access_token, response.token_type);
    var user = await discord.getUser(userData.id);
    if (!userData.verified) return data.res.redirect("/?alert=You need to have a verified email on your account in order to vote.");
    if (!user) return data.res.redirect("/?server=true");
    if (user.user.createdTimestamp > 1575158400000) return data.res.redirect("/?alert=Your account was created after December 1st 2019, which means you cannot vote.");

    var sessionToken = auth.generateToken();
    auth.setToken(userData.id, sessionToken, response.access_token);
    auth.setCookies(data.res, userData.id, sessionToken);

    if (!users.getUser(userData.id)) users.setUser(userData.id, []);

    data.res.redirect("/");
  } catch (e) {
    console.error(e);
    data.res.redirect("/logout?alert=An unknown error occurred while trying to login. Ping @AlexejheroYTB%231636 about this.");
  }
}