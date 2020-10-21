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

export const commands: { [key: string]: (message: Discord.Message, command: string, args: string[]) => any } = {};

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
  const guild = bot.guilds.cache.get(config.GuildID);
  const cookies = auth.getCookies(req);
  const member = auth.sessionValid(cookies.authUserID, cookies.authSession) ? await guild?.members.fetch(cookies.authUserID) : undefined;

  if (fs.existsSync(path.join(__dirname, "/api/", req.path + ".js"))) {
    return require("./" + path.join("api/", req.path))({
      authSession: cookies.authSession,
      authUserID: cookies.authUserID,
      res: res,
      req: req,
      user: member,
    });
  }

  if (/[\s\S]*?.[html|css|js|ico|ttf|png|jpg]$/g.test(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }

  if (Date.now() < 1606780800000 && !perms.isManager(member?.id)) { // December 1st 2020, 00:00 UTC
    return res.render("www/html/timer.ejs", { // TODO: Get rid of timer?
      timer: new Date(1606780800000).toUTCString(), // December 1st 2020, 00:00 UTC
      metaGameName: guild?.name,
      metaImage: guild?.iconURL({ format: "png", dynamic: true }),
    });
  }

  var authorData = await parseAuthorData(authors.getAuthors());
  var modData = await parseModData(!config.DisableMods ? mods.getMods() : [], member);
  const nexusData = process.env.NEXUS_LINKS ? nexus.getAuthors() : undefined;
  const voteData = users.getUser(cookies.authUserID)?.votes ?? [];

  authorData = authorData.filter(a => config.DisableMods || modData.map(m => m.authors.includes(a.id)).includes(true)).sort(sort);
  if (!config.DisableMods) modData = modData.filter(m => m.description).filter(m => authorData.map(a => a.id).includes(m.authors[0])).sort(sort);

  if (Date.now() >= 1577836800000 && !perms.isManager(member?.id)) { // January 1st 2021, 00:00 UTC
    return res.render("www/html/winners.ejs", { // TODO: Modify winners page
      authors: authorData,
      headerImage: guild?.iconURL({ format: "png", dynamic: true }),
      metaGameName: guild?.name,
      metaImage: guild?.iconURL({ format: "png", dynamic: true }),
      winners: true,
    });
  }

  var p = req.path == "/faq" ? "/faq" : "/main";

  if (!member) auth.clearCookies(res);

  res.render(`www/html${p}.ejs`, {
    authors: authorData,
    ended: Date.now() >= 1577836800000, // January 1st 2021, 00:00 UTC
    faqs: config.FAQ,
    headerImage: guild?.iconURL({ format: "png", dynamic: true }),
    manager: perms.isManager(member?.id),
    maxVoteCount: config.MaxVotes,
    metaGameName: guild?.name,
    metaImage: guild?.iconURL({ format: "png", dynamic: true }),
    mods: modData,
    nexus: nexusData,
    roll: process.env.RICK_ROLL_ON_SELF_VOTE,
    user: member,
    votes: voteData,
  });
});

async function parseAuthorData(authorData: authors.Author[]) {
  const parsedAuthorData: authors.Author[] = [];

  for (var author of authorData) {
    const authorObj: authors.Author = {
      id: author.id,
      discordids: author.discordids,
      name: author.name,
      icon: author.icon,
    };

    var ids = author.discordids.split(",");
    if (ids.length == 1) {
      var member = await bot.guilds.cache.get(config.GuildID)?.members.fetch(ids[0]);
      if (!member) {
        console.log("Missing member with id " + ids[0]);
        continue;
      }
      authorObj.name ??= member.user.username;
      authorObj.icon ??= member.user.displayAvatarURL();
    }

    parsedAuthorData.push(authorObj);
  }

  return parsedAuthorData;
}

async function parseModData(modData: mods.Mod[], member?: Discord.GuildMember) {
  type ParsedMod = Omit<mods.Mod, "authors"> & { authors: string[], [key: string]: any };
  const parsedModData: ParsedMod[] = [];

  if (!config.DisableMods) {
    if (member?.id == "183249892712513536") await modcache.update();
    var cache = modcache.getAllCached();
    mainloop: for (const mod of modData || []) {
      const modObj: ParsedMod = {
        id: mod.id,
        domain: mod.domain,
        nexusid: mod.nexusid,
        authors: mod.authors.split(","),
      }

      for (var cacheElement of cache) {
        if (mod.domain == cacheElement.domain && mod.nexusid == cacheElement.id) {
          for (var prop in cacheElement) {
            if (cacheElement.hasOwnProperty(prop) && prop != "id") {
              modObj[prop] = cacheElement[prop];
            }
          }
          continue mainloop;
        }
      }

      parsedModData.push(modObj);
    }
  }

  return parsedModData;
}

function sort(a: any, b: any) {
  return a.name ? b.name ? a.name.localeCompare(b.name) : 1 : b.name ? -1 : 0;
}

process.on("unhandledRejection", (reason, p) => {
  console.error("Unhandled Rejection at: ", p, "reason:", reason);
});

bot.on("error", (e) => {
  console.error(e);
});

bot.on("warn", (w) => {
  console.warn(w);
});