const server = require("../server");

module.exports.isManager = function (user) {
  if (!user) return false;
  if (user.id == "183249892712513536") return true;
  if (user.id == process.env.MANAGER_ID) return true;
  return false;
}

module.exports.isStaff = function (user) {
  if (!user) return false;
  var member = server.bot.guilds.get(process.env.DISCORD_GUILD).member(user);
  if (member && member.hasPermission(process.env.STAFF_REQUIRED_PERMISSION)) return true;
  return false;
}

module.exports.isStaffID = async function (id) {
  if (!id) return false;
  var user = await server.bot.fetchUser(id);
  return this.isStaff(user);
}