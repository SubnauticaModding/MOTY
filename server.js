require("dotenv").config();

const betterSqlite3 = require("better-sqlite3");
const Discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const http = require("http");
const moment = require("moment-timezone");
const path = require("path");

const auth = require("./src/auth");
const authors = require("./src/authors");
const commands = require("./src/commands");
const discord = require("./src/discord");
const mods = require("./src/mods");
const perms = require("./src/perms");
const users = require("./src/users");

const web = express();
web.set("views", __dirname);
web.use(require("cookie-parser")());
web.use(require("body-parser").json());
web.use(require("body-parser").urlencoded({
  extended: false
}));
web.listen(process.env.PORT);

module.exports.bot = new Discord.Client({
  fetchAllMembers: true,
});
module.exports.db = betterSqlite3("data/login.db");

this.bot.login(process.env.DISCORD_TOKEN);

this.bot.on("ready", () => {
  console.log("Logged in as " + this.bot.user.tag);
  this.bot.user.setStatus("invisible");
  commands();
  this.db.prepare("CREATE TABLE if not exists logindata (userid TEXT PRIMARY KEY, sessionkey TEXT, authkey TEXT);").run();
});

this.bot.on("message", (message) => {
  if (!message.guild) return;
  if (!message.content.toLowerCase().startsWith("moty/")) return;
  if (!perms.isAdmin(message.author)) return;

  var args = message.content.slice(5).trim().split(/ +/g);
  var command = args.shift().toLowerCase();

  try {
    var com = this.commands.get(command);
    if (com) com(message, command, args);
  } catch (e) {
    console.error(e);
  }
});

web.all("*", async (req, res) => {
  var {
    authUserID,
    authSession
  } = auth.getCookies(req);
  var user = await discord.getUser(authUserID);

  if (fs.existsSync(path.join(__dirname, "/api/", req.path + ".js"))) {
    return require("./" + path.join("api/", req.path))({
      authSession,
      authUserID,
      res,
      req,
      user,
    });
  }

  if (/[\s\S]*?.[html|css|js|ico|ttf|png|jpg]$/g.test(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }

  if (new Date(Date.now()) < moment("2019-12-01T00:00:00Z").tz("UTC")._d && !perms.isAdmin(user)) {
    return res.render("www/html/timer.ejs", {
      timer: moment("2019-12-01T00:00:00Z").tz("UTC")._d.toString(),
      message: false,
    });
  }

  if (new Date(Date.now()) > moment("2020-01-01T00:00:00Z").tz("UTC")._d) {
    return res.render("www/html/timer.ejs", {
      message: "The event has ended",
    });
  }

  var a = authors.getAuthors();
  var m = mods.getMods();
  var v = JSON.parse(users.getUser(authUserID)) && JSON.parse(users.getUser(authUserID)).votes ? JSON.parse(users.getUser(authUserID)).votes : [];

  if (req.path == "/raw") return res.render("www/html/raw.ejs", {
    authors: a,
    mods: m,
    votes: v,
    user,
  });

  res.render("www/html/main.ejs", {
    authors: a,
    mods: m,
    votes: v,
    user,
  });
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at: ', p, 'reason:', reason);
});

this.bot.on('error', (e) => {
  console.error(e);
});

this.bot.on('warn', (w) => {
  console.warn(w);
});

setInterval(() => {
  http.get(`http://sn-moty.glitch.me/`);
}, 260000);