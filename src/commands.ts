import readdir from "fs-readdir-recursive";
import * as server from ".";

/** Loads all commands */
export async function initialize() {
  var files = readdir("./commands/").filter(f => f.endsWith(".js")); // TODO: Adjust path?

  for (var f of files) {
    const props = await import(`../commands/${f}`);
    server.commands[f.substring(0, f.length - 3)] = props;
  }
}