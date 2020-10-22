import { EndpointData } from "../src";
import * as auth from "../src/auth";
import * as authors from "../src/authors";
import * as perms from "../src/perms";
import * as users from "../src/users";

export default function (data: EndpointData): any {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession)) return data.res.sendStatus(401); // Unauthorized
    if (!perms.isManager(data.user?.id)) {
      return data.res.sendStatus(403); // Forbidden 
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

    data.res.status(200).send(votes); // OK
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500); // Internal Server Error
  }
}