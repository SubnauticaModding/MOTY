const mods = require("../src/mods");

module.exports = function (message, command, args) {
  mods.removeMod(args[0]);
  message.channel.send(`**Removed mod**\nID: \`${args[0]}\``);
}