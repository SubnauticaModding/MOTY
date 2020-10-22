import { Message } from "discord.js";
import * as modcache from "../src/modcache";
import * as mods from "../src/mods";

export default function (message: Message, command: string, args: string[]) {
  var existingMod = mods.getMod(args[0]);
  mods.setMod(args[0], args[1] as modcache.Domain, args[2], args[3]);
  message.channel.send(`**${existingMod ? "Updated mod" : "Added mod"}**\nID: \`${args[0]}\`\nDomain: \`${args[1]}\`\nNexus ID: \`${args[2]}\`\nAuthor(s): \`${args[3]}\`${(existingMod ? `\nOld values: \`${JSON.stringify(existingMod)}\`` : "")}`);

  modcache.cache(args[1] as modcache.Domain, args[2]);
}