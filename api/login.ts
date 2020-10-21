import * as config from "../config.json";
import * as server from "../src";
import * as auth from "../src/auth";

export default function (data: server.EndpointData) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      if (!data.user) data.res.redirect(config.GuildInvite);
      else data.res.redirect("/");
    } else {
      data.res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${server.bot.user?.id}&redirect_uri=https%3A%2F%2Fsubnauticamodding.xyz%2Fauth&response_type=code&scope=identify%20email`);
    }
  } catch (e) {
    console.error(e);
    data.res.redirect("/");
  }
}