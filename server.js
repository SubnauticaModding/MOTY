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
const modcache = require("./src/modcache");
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
  var user = auth.sessionValid(authUserID, authSession) ? await discord.getUser(authUserID) : undefined;

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

  var authorData = authors.getAuthors();
  var modData = mods.getMods();
  var voteData = users.getUser(authUserID) && users.getUser(authUserID).votes ? users.getUser(authUserID).votes : [];

  for (var author of authorData) {
    var ids = author.discordids.split(",");
    if (ids.length == 1) {
      var discordUser = await discord.getUser(ids[0]);
      author.name = discordUser.user.username;
      author.icon = discordUser.user.displayAvatarURL;
    }
  }

  await modcache.update();
  var cache = modcache.getAllCached();
  mainloop: for (var mod of modData) {
    mod.authors = mod.authors.split(",");

    for (var cacheElement of cache) {
      if (mod.domain == cacheElement.domain && mod.nexusid == cacheElement.id) {
        for (var prop in cacheElement) {
          if (cacheElement.hasOwnProperty(prop) && prop != "id") {
            mod[prop] = cacheElement[prop];
          }
        }
        continue mainloop;
      }
    }
  }

  authorData.sort(sort);
  modData.sort(sort);

  var p = "/main";
  if (req.path == "/raw" || req.path == "/privacy") p = req.path;

  res.render(`www/html${p}.ejs`, {
    authors: authorData,
    mods: modData,
    votes: voteData,
    user,
  });
});

function sort(a, b) {
  return a.name.localeCompare(b.name);
}

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: ", p, "reason:", reason);
});

this.bot.on("error", (e) => {
  console.error(e);
});

this.bot.on("warn", (w) => {
  console.warn(w);
});

setInterval(() => {
  http.get(`http://sn-moty.glitch.me/`);
}, 260000);