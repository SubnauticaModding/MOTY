const mods = require("../src/mods");

module.exports = function (message, command, args) {
  var existingMod = mods.getMod(args[0]);
  mods.setMod(args[0], args[1], args[2], args[3]);
  message.channel.send(`**Added mod**\nID: \`${args[0]}\`\nDomain: \`${args[1]}\`\nNexus ID: \`${args[2]}\`\nAuthor(s): \`${args[3]}\`${(existingMod ? `\nOld values: \`${existingMod}\`` : "")}`);
}