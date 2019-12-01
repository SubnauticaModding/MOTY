require("dotenv").config();
for (var prop in process.env) {
  if (process.env[prop] == "true") process.env[prop] = true;
  else if (process.env[prop] == "false") process.env[prop] = false;
  else if (parseInt(process.env[prop]).toString() == process.env[prop]) process.env[prop] = parseInt(process.env[prop]);
}

const betterSqlite3 = require("better-sqlite3");
const Discord = require("discord.js");
const express = require("express");
const fs = require("fs");
const moment = require("moment-timezone");
const path = require("path");

const auth = require("./src/auth");
const authors = require("./src/authors");
const commands = require("./src/commands");
const discord = require("./src/discord");
const modcache = require("./src/modcache");
const mods = require("./src/mods");
const nexus = require("./src/nexus");
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

this.bot.on("ready", async () => {
  var guilds = this.bot.guilds.array();

  for (let i = 0; i < guilds.length; i++) {
    await this.bot.guilds.get(guilds[i].id).fetchMembers();
  }

  console.log("Logged in as " + this.bot.user.tag);
  commands();
  this.db.prepare("CREATE TABLE if not exists logindata (userid TEXT PRIMARY KEY, sessionkey TEXT, authkey TEXT);").run();
});

this.bot.on("message", (message) => {
  if (!message.guild) return;
  if (message.guild.id != process.env.DISCORD_GUILD) return;
  if (!message.content.toLowerCase().startsWith("moty/")) return;
  if (!perms.isManager(message.author)) return;

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

  if (new Date(Date.now()) < moment("2019-12-01T00:00:00Z").tz("UTC")._d && !perms.isStaff(user)) {
    return res.render("www/html/timer.ejs", {
      timer: moment("2019-12-01T00:00:00Z").tz("UTC")._d.toString(),
      metaGameName: this.bot.guilds.get(process.env.DISCORD_GUILD).name,
      metaImage: process.env.WEBSITE_META_IMAGE,
    });
  }

  var authorData = authors.getAuthors();
  var nexusData = process.env.NEXUS_LINKS ? nexus.getAuthors() : null;
  var modData = !process.env.DISABLE_MODS ? mods.getMods() : null;
  var voteData = users.getUser(authUserID) && users.getUser(authUserID).votes ? users.getUser(authUserID).votes : [];

  for (var author of authorData) {
    var ids = author.discordids.split(",");
    if (ids.length == 1) {
      var discordUser = await discord.getUser(ids[0]);
      if (!discordUser) {
        console.log("Missing user with id " + ids[0]);
        author.remove = true;
        continue;
      }
      author.name = discordUser.user.username;
      author.icon = discordUser.user.displayAvatarURL;
    }
  }

  if (!process.env.DISABLE_MODS) {
    if (user && user.id == "183249892712513536") await modcache.update();
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
  }

  authorData = authorData.filter(a => !a.remove).filter(a => process.env.DISABLE_MODS ? true : modData.map(m => m.authors.includes(a.id)).includes(true)).sort(sort);
  if (!process.env.DISABLE_MODS) modData = modData.filter(m => m.description).filter(m => authorData.map(a => a.id).includes(m.authors[0])).sort(sort);

  if (new Date(Date.now()) > moment("2020-01-01T00:00:00Z").tz("UTC")._d && !perms.isStaff(user)) {
    return res.render("www/html/winners.ejs", {
      authors: authorData,
      headerImage: this.bot.guilds.get(process.env.DISCORD_GUILD).icon.startsWith("a_") ? this.bot.guilds.get(process.env.DISCORD_GUILD).iconURL.split("").reverse().join("").replace(/.*?\./, "fig.").split("").reverse().join("") : this.bot.guilds.get(process.env.DISCORD_GUILD).iconURL,
      metaGameName: this.bot.guilds.get(process.env.DISCORD_GUILD).name,
      metaImage: process.env.WEBSITE_META_IMAGE,
      winners: true,
    });
  }

  var p = "/main";
  if (req.path == "/faq") p = req.path;

  var faqs = [];
  if (process.env.FAQS) {
    for (var faq of process.env.FAQS.split(" \/\/\/\/ ")) faqs.push({
      q: faq.split(" \/\/ ")[0],
      a: faq.split(" \/\/ ")[1]
    });
  }

  res.render(`www/html${p}.ejs`, {
    authors: authorData,
    ended: new Date(Date.now()) > moment("2020-01-01T00:00:00Z").tz("UTC")._d,
    faqs: faqs.length != 0 ? faqs : null,
    headerImage: this.bot.guilds.get(process.env.DISCORD_GUILD).icon.startsWith("a_") ? this.bot.guilds.get(process.env.DISCORD_GUILD).iconURL.split("").reverse().join("").replace(/.*?\./, "fig.").split("").reverse().join("") : this.bot.guilds.get(process.env.DISCORD_GUILD).iconURL,
    manager: perms.isManager(user),
    maxVoteCount: process.env.MAX_VOTE_COUNT,
    metaGameName: this.bot.guilds.get(process.env.DISCORD_GUILD).name,
    metaImage: process.env.WEBSITE_META_IMAGE,
    mods: modData,
    nexus: nexusData,
    roll: process.env.RICK_ROLL_ON_SELF_VOTE,
    staff: perms.isStaff(user) ? process.env.STAFF_VOTE_MULTIPLIER : -1,
    user,
    votes: voteData,
  });
});

function sort(a, b) {
  return a.name ? b.name ? a.name.localeCompare(b.name) : 1 : 0;
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