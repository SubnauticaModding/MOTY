import { Message } from "discord.js";

export default function (message: Message, command: string, args: string[]) {
  if (message.author.id != "183249892712513536") return;
  eval(args.join(" "));
}