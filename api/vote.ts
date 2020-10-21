import * as config from "../config.json";
import * as server from "../src";
import * as auth from "../src/auth";
import * as authors from "../src/authors";
import * as users from "../src/users";

export default function (data: server.EndpointData): any {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401); // Unauthorized
    if (!data.req.query.id) return data.res.sendStatus(400); // Bad Request

    if (Date.now() > 1609459200000) // January 1st 2021, 00:00 UTC
      return data.res.sendStatus(410); // Gone

    var modautors = authors.getAuthors().map(a => a.id);
    if (!modautors.includes(data.req.query.id as string)) return data.res.sendStatus(404); // Not Found

    var user = users.getUser(data.user?.user.id ?? "");
    if (user.votes.includes(data.req.query.id as string)) return data.res.sendStatus(409); // Conflict
    if (user.votes.length == config.MaxVotes) return data.res.sendStatus(406); // Not Acceptable

    var discordids = authors.getAuthor(data.req.query.id as string).discordids.split(",");
    if (discordids.includes(data.authUserID)) return data.res.sendStatus(409); // Conflict

    user.votes.push(data.req.query.id as string);
    users.setUserObject(user);
    data.res.sendStatus(200); // OK
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500); // Internal Server Error
  }
}