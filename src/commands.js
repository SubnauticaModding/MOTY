const Discord = require("discord.js");
const read = require("fs-readdir-recursive");

const server = require("../server");

module.exports = function () {
  server.bot.commands = new Discord.Collection();
  
  var files = read('./commands/').filter(f => f.endsWith(".js"));

  for (var f of files) {
    const props = require(`../commands/${f}`);
    server.bot.commands.set(props.help.name, props);
  }
}