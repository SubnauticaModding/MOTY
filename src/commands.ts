import readdir from "fs-readdir-recursive";
import * as server from ".";

/** Loads all commands */
export function initialize() {
  var files = readdir("./commands/").filter(f => f.endsWith(".js"));

  for (var f of files) {
    const props = require(`../commands/${f}`);
    server.commands[f.substring(0, f.length - 3)] = props;
  }
}