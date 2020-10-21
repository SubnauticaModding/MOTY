import * as Discord from "discord.js";
import readdir from "fs-readdir-recursive";
import * as server from ".";

/** Loads all commands */
export function initialize() {
  server.commands = new Discord.Collection();

  var files = readdir("./commands/").filter(f => f.endsWith(".js"));

  for (var f of files) {
    const props = require(`../commands/${f}`);
    server.commands.set(f.substring(0, f.length - 3), props);
  }
}