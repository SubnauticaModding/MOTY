import { EndpointData } from "../src";
import * as auth from "../src/auth";
import * as perms from "../src/perms";
import * as users from "../src/users";

export default function (data: EndpointData): any {
  try {
    if (!auth.sessionValid(data.authUserID, data.authSession) || !perms.isManager(data.user?.id)) return data.res.sendStatus(403); // Forbidden

    var u = users.getUsers();

    for (var _u of u) {
      _u.votes = [];
      users.setUserObject(_u);
    }

    data.res.sendStatus(200); // OK
  } catch (e) {
    console.error(e);
    data.res.sendStatus(500); // Internal Server Error
  }
}