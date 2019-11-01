const mods = require("../src/mods");

module.exports = function (message, command, args) {
  var existingMod = mods.getMod(args[0]);
  if (!existingMod) {
    message.channel.send("Mod does not exist.");
    return;
  }
  mods.removeMod(args[0]);
  message.channel.send(`**Removed mod**\nID: \`${args[0]}\`\nOld values: \`${JSON.stringify(existingMod)}\``);
}