import { Message } from "discord.js";
import * as mods from "../src/mods";

export default function (message: Message, command: string, args: string[]) {
  var existingMod = mods.getMod(args[0]);
  if (!existingMod) {
    message.channel.send("Mod does not exist.");
    return;
  }
  mods.removeMod(args[0]);
  message.channel.send(`**Removed mod**\nID: \`${args[0]}\`\nOld values: \`${JSON.stringify(existingMod)}\``);
}