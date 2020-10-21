import * as querystring from "querystring";
import * as request from "request-promise";
import * as config from "../config.json";
import * as server from "../src";
import * as auth from "../src/auth";
import * as users from "../src/users";

export default async function (data: server.EndpointData) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      if (!data.user) return data.res.redirect(config.GuildInvite);
      return data.res.redirect("/");
    }

    if (!data.req.query.code) return data.res.redirect("/?alert=Invalid authentication code. Let @AlexejheroYTB%231636 know about this.");

    var response = await request.post({
      uri: "https://discordapp.com/api/oauth2/token",
      body: querystring.stringify({
        "client_id": server.bot.user?.id,
        "client_secret": process.env.DISCORD_SECRET,
        "grant_type": "authorization_code",
        "redirect_uri": "https://subnauticamodding.xyz/auth",
        "scope": "identify email",
        "code": data.req.query.code as string,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
    });
    response = JSON.parse(response);

    var userData = await auth.getUserData(response.access_token, response.token_type);
    var user = await server.bot.users.fetch(userData.id);
    if (!userData.verified) return data.res.redirect("/?alert=You need to have a verified email on your account in order to vote.");
    if (!user) return data.res.redirect("/?server=true&invite=" + encodeURIComponent(config.GuildInvite));
    if (user.createdTimestamp > 1606780800000) // December 1st 2020, 00:00 UTC
      return data.res.redirect("/?alert=Your account was created after December 1st 2020, which means you cannot vote.");

    var sessionToken = auth.generateSessionToken();
    auth.saveLoginData(userData.id, sessionToken, response.access_token);
    auth.setCookies(data.res, userData.id, sessionToken);

    if (!users.getUser(userData.id)) users.setUser(userData.id, []);

    data.res.redirect("/");
  } catch (e) {
    console.error(e);
    data.res.redirect("/logout?alert=An unknown error occurred while trying to login. Let @AlexejheroYTB%231636 know about this.");
  }
}