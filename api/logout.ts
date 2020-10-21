import { EndpointData } from "../src";
import * as auth from "../src/auth";

export default function (data: EndpointData) {
  try {
    if (auth.sessionValid(data.authUserID, data.authSession)) {
      auth.clearCookies(data.res);
      auth.deleteLoginData(data.authUserID);
    }
    if (data.req.query.alert) return data.res.redirect("/?alert=" + data.req.query.alert);
    data.res.redirect("/");
  } catch (e) {
    console.error(e);
    data.res.redirect("/?alert=An unknown error occurred while trying to login. Let @AlexejheroYTB%231636 know about this.");
  }
}