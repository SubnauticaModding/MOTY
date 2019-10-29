const server = require("../server");

module.exports.isAdmin = function (user) {
  if (!user) return false;
  var memberInOurGuild = server.bot.guilds.get("324207629784186882").member(user);
  memberInOurGuild.hasPermission("ADMINISTRATOR")
  if (memberInOurGuild && memberInOurGuild.hasPermission("ADMINISTRATOR")) return true;
  else return false;
}