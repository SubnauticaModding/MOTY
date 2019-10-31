const server = require("../server");

module.exports.isAdmin = function (user) {
  if (!user) return false;
  var memberInOurGuild = server.bot.guilds.get("324207629784186882").member(user);
  if (memberInOurGuild && memberInOurGuild.hasPermission("BAN_MEMBERS")) return true;
  else return false;
}