import Request from "express-serve-static-core";
import * as request from "request-promise";
import * as server from ".";

/** Gets information about a user from Discord's API */
export async function getUserData(token: string, tokenType = "Bearer") {
  var response: string = await request.get({
    uri: "https://discordapp.com/api/users/@me",
    headers: {
      "Authorization": tokenType + " " + token
    },
  });
  return JSON.parse(response);
}

/** Saves a user's login data to the database */
export function saveLoginData(userId: string, sessionToken: string, discordToken: string) {
  server.db.prepare("UPDATE logindata SET sessionkey=?, authkey=? WHERE userid=?;").run(sessionToken, discordToken, userId);
  server.db.prepare("INSERT OR IGNORE INTO logindata (userid, sessionkey, authkey) VALUES (?, ?, ?);").run(userId, sessionToken, discordToken);
}

/** Deletes a user's login data from the database */
export function deleteLoginData(userId: string) {
  server.db.prepare("DELETE FROM logindata WHERE userid=?;").run(userId);
}

/** Gets a user's Discord OAuth token from the database */
export function getDiscordToken(userId: string): string | undefined {
  var row = server.db.prepare("SELECT * FROM logindata WHERE userid=?;").get(userId);
  if (row) return row.authkey;
  else return undefined;
}

/** Checks if a user's session is valid or not */
export function sessionValid(userId: string, sessionToken: string) {
  if (!userId) return false;
  var row = server.db.prepare("SELECT * FROM logindata WHERE userid=?;").get(userId);
  if (row && row.sessionkey == sessionToken) return true;
  else return false;
}

/** Gets authentication cookies from a request */
export function getCookies(req: Request.Request) {
  if (!req.cookies) return {
    authUserID: "",
    authSession: "",
  };

  var user: string = req.cookies["auth_userid"] ?? "";
  var session: string = req.cookies["auth_session"] ?? "";
  return {
    authUserID: user,
    authSession: session,
  };
}

/** Sets authentication cookies on a response */
export function setCookies(res: Request.Response, userId: string, sessionToken: string) {
  res.cookie("auth_userid", userId, {
    maxAge: 1000 * 60 * 60 * 24 * 365
  });
  res.cookie("auth_session", sessionToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365
  });
}

/** Clears authentication cookies from a response */
export function clearCookies(res: Request.Response) {
  res.clearCookie("auth_userid");
  res.clearCookie("auth_session");
}

/** Generates a random session token */
export function generateSessionToken(length = 18) {
  var str = "";
  var possibleChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < length; i++) {
    str += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return str;
}