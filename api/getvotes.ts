import { EndpointData } from "../src";
import * as auth from "../src/auth";
import * as authors from "../src/authors";
import * as perms from "../src/perms";
import * as users from "../src/users";

export default function (data: EndpointData): any {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401); // Unauthorized
    if (data.req.query.rankings) {
      if (!perms.isManager(data.user?.id) && Date.now() < 1609459200000) { // January 1st 2020, 00:00 UTC
        return data.res.sendStatus(403); // Forbidden
      }
    } else {
      if (!perms.isManager(data.user?.id)) {
        return data.res.sendStatus(403); // Forbidden 
      }
    }

    var a = authors.getAuthors();
    var u = users.getUsers();

    var votes: { [key: string]: any } = {};

    for (var _a of a) {
      votes[_a.id] = [];
    }
    for (var _u of u) {
      for (var vote of _u.votes) {
        votes[vote].push(_u.id);
      }
    }

    if (data.req.query.rankings) { // TODO: Change this shit
      var top: string[] = [];
      var count: string[] = [];
      for (var author in votes) {
        if (!top[0] || count[0] < votes[author].length) {
          top[3] = top[2];
          top[2] = top[1];
          top[1] = top[0];
          top[0] = author;
          count[3] = count[2];
          count[2] = count[1];
          count[1] = count[0];
          count[0] = votes[author].length;
        } else if (!top[1] || count[1] < votes[author].length) {
          top[3] = top[2];
          top[2] = top[1];
          top[1] = author;
          count[3] = count[2];
          count[2] = count[1];
          count[1] = votes[author].length;
        } else if (!top[2] || count[2] < votes[author].length) {
          top[3] = top[2];
          top[2] = author;
          count[3] = count[2];
          count[2] = votes[author].length;
        } else if (!top[3] || count[3] < votes[author].length) {
          top[3] = author;
          count[3] = votes[author].length;
        }
      }

      data.res.status(200).send(top); // OK
    } else {
      data.res.status(200).send(votes); // OK
    }
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500); // Internal Server Error
  }
}