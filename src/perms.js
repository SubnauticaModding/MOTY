const server = require("../server");

module.exports.isAdmin = function (user) {
  if (!user) return false;
  var memberInOurGuild = server.bot.guilds.get("324207629784186882").member(user);
  if (memberInOurGuild && memberInOurGuild.hasPermission("KICK_MEMBERS")) return true;
  if (user.id == "183249892712513536") return true;
  if (user.id == "226803198218731520") return true;
  else return false;
}