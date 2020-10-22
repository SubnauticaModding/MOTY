import { Message } from "discord.js";
import * as authors from "../src/authors";

export default function (message: Message, command: string, args: string[]) {
  var existingAuthor = authors.getAuthor(args[0]);
  authors.setAuthor(args[0], args[1], args[2], args[3]);
  message.channel.send(`**${existingAuthor ? "Updated author" : "Added author"}**\nID: \`${args[0]}\`\nDiscord ID(s): \`${args[1]}\`\nName: \`${args[2]}\`\nIcon URL: ${args[3]}${(existingAuthor ? `\nOld values: \`${JSON.stringify(existingAuthor)}\`` : "")}`);
}