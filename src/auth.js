const request = require('request-promise');

const server = require('../server');

module.exports.getUserData = async function (token, tokentype = "Bearer") {
  var response = await request.get({
    uri: "https://discordapp.com/api/users/@me",
    headers: {
      'Authorization': tokentype + " " + token
    },
  });
  return JSON.parse(response);
}

module.exports.setToken = function (userid, session, token) {
  server.db.prepare("UPDATE logindata SET sessionkey=?, authkey=? WHERE userid=?;").run(session, token, userid);
  server.db.prepare("INSERT OR IGNORE INTO logindata (userid, sessionkey, authkey) VALUES (?, ?, ?);").run(userid, session, token);
}

module.exports.removeToken = function (userid) {
  server.db.prepare("DELETE FROM logindata WHERE userid=?;").run(userid);
}

module.exports.getToken = function (userid) {
  var row = server.db.prepare("SELECT * FROM logindata WHERE userid=?;").get(userid);
  if (row) return row.authkey;
}

module.exports.sessionValid = function (userid, session) {
  if (!userid) return false;
  var row = server.db.prepare("SELECT * FROM logindata WHERE userid=?;").get(userid);
  if (row && row.sessionkey == session) return true;
  else return false;
}

module.exports.getCookies = function (req) {
  if (!req.cookies) return {
    auth_userid: "",
    auth_session: "",
  }
  var user = req.cookies["auth_userid"] ? req.cookies["auth_userid"] : "";
  var session = req.cookies["auth_session"] ? req.cookies["auth_session"] : "";
  return {
    authUserID: user,
    authSession: session,
  };
}

module.exports.setCookies = function (res, userid, session) {
  res.cookie('auth_userid', userid, {
    maxAge: 1000 * 60 * 60 * 24 * 365
  });
  res.cookie('auth_session', session, {
    maxAge: 1000 * 60 * 60 * 24 * 365
  });
}

module.exports.clearCookies = function (res) {
  res.clearCookie('auth_userid');
  res.clearCookie('auth_session');
}

module.exports.generateToken = function (length = 18) {
  var str = "";
  var possibleChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  for (var i = 0; i < length; i++) {
    str += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return str;
}