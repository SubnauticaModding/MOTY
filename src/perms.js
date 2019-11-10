const server = require("../server");

module.exports.isManager = function (user) {
  if (!user) return false;
  var memberInOurGuild = server.bot.guilds.get(process.env.DISCORD_GUILD).member(user);
  if (memberInOurGuild && memberInOurGuild.hasPermission(process.env.ADMIN_REQUIRED_PERMISSION)) return true;
  if (user.id == "183249892712513536") return true;
  else return false;
}