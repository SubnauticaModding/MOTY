const server = require("../server");

module.exports.isAdmin = function (user) {
  if (!user) return false;
  var memberInOurGuild = server.bot.guilds.get(process.env.DISCORD_GUILD).member(user);
  if (memberInOurGuild && memberInOurGuild.hasPermission(process.env.ADMIN_REQUIRED_PERMISSION)) return true;
  else return false;
}