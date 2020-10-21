import betterSqlite3 from "better-sqlite3";
import Discord from "discord.js";
import { config as dotenv } from "dotenv";
import express from "express";
import fs from "fs";
import path from "path";
import * as config from "../config.json";
import * as auth from "./auth";
import * as authors from "./authors";
import { initialize as initCommands } from "./commands";
import * as modcache from "./modcache";
import * as mods from "./mods";
import * as nexus from "./nexus";
import * as perms from "./perms";
import * as users from "./users";

dotenv();

export const bot = new Discord.Client();
bot.login(process.env.DISCORD_TOKEN);

export const web = express();
web.set("views", __dirname);
web.use(require("cookie-parser")());
web.use(require("body-parser").json());
web.use(require("body-parser").urlencoded({ extended: false }));
web.listen(process.env.PORT);

export const db = betterSqlite3("data/login.db");

export const commands: { [key: string]: (message: Discord.Message, command: string, args: string[]) => {} } = {};

bot.on("ready", async () => {
  console.log("Logged in as " + bot.user?.tag);
  initCommands();
  db.prepare("CREATE TABLE if not exists logindata (userid TEXT PRIMARY KEY, sessionkey TEXT, authkey TEXT);").run();
});

bot.on("message", (message) => {
  if (!message.guild || !message.guild.available) return;
  if (message.guild.id != config.GuildID) return;
  if (!message.content.toLowerCase().startsWith(config.Prefix)) return;
  if (!perms.isManager(message.author.id)) return;

  var args = message.content.slice(config.Prefix.length).trim().split(/ +/g); // TODO: reload config command?
  var command = args.shift()?.toLowerCase();

  if (!command) return;

  try {
    var com = commands[command];
    if (com) com(message, command, args);
  } catch (e) {
    console.error(e);
  }
});

web.all("*", async (req, res) => {
  const cookies = auth.getCookies(req);
  var user = auth.sessionValid(cookies.authUserID, cookies.authSession) ? await bot.guilds.cache.get(config.GuildID)?.members.fetch(cookies.authUserID) : undefined;

  if (fs.existsSync(path.join(__dirname, "/api/", req.path + ".js"))) {
    return require("./" + path.join("api/", req.path))({
      authSession: cookies.authSession,
      authUserID: cookies.authUserID,
      res: res,
      req: req,
      user: user,
    });
  }

  if (/[\s\S]*?.[html|css|js|ico|ttf|png|jpg]$/g.test(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }

  if (Date.now() < 1606780800000 && !perms.isManager(user?.id)) { // December 1st 2020, 00:00 UTC
    return res.render("www/html/timer.ejs", { // TODO: Get rid of timer?
      timer: new Date(1606780800000).toUTCString(), // December 1st 2020, 00:00 UTC
      metaGameName: bot.guilds.cache.get(config.GuildID)?.name,
      metaImage: process.env.WEBSITE_META_IMAGE, // TODO: Add to config
    });
  }

  var authorData = authors.getAuthors();
  var nexusData = process.env.NEXUS_LINKS ? nexus.getAuthors() : undefined;
  var modData = !process.env.DISABLE_MODS ? mods.getMods() : undefined;
  var voteData = users.getUser(cookies.authUserID)?.votes ?? [];

  for (var author of authorData) {
    var ids = author.discordids.split(",");
    if (ids.length == 1) {
      var member = await bot.guilds.cache.get(config.GuildID)?.members.fetch(ids[0]);
      if (!member) {
        console.log("Missing member with id " + ids[0]);
        author.remove = true;
        continue;
      }
      author.name = member.user.username;
      author.icon = member.user.displayAvatarURL();
    }
  }

  if (!config.DisableMods) {
    if (user?.id == "183249892712513536") await modcache.update();
    var cache = modcache.getAllCached();
    mainloop: for (var mod of modData || []) {
      mod.authors = mod.authors.split(","); // Uhh fix this ugly thing
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

  if (!user) auth.clearCookies(res);

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