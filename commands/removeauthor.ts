import { Message } from "discord.js";
import * as authors from "../src/authors";

export default function (message: Message, command: string, args: string[]) {
  var existingAuthor = authors.getAuthor(args[0]);
  if (!existingAuthor) {
    message.channel.send("Author does not exist.");
    return;
  }
  authors.removeAuthor(args[0]);
  message.channel.send(`**Removed author**\nID: \`${args[0]}\`\nOld values: \`${JSON.stringify(existingAuthor)}\``);
}