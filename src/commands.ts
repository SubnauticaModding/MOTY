import readdir from "fs-readdir-recursive";
import * as path from "path";
import * as server from ".";

/** Loads all commands */
export async function initialize() {
  var files = readdir(path.join(__dirname, "../commands/")).filter(f => f.endsWith(".js"));

  for (var f of files) {
    const props = await import(`../commands/${f}`);
    server.commands[f.substring(0, f.length - 3)] = props.default;
  }
}