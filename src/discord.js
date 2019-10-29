const server = require("../server");

module.exports.getUser = async function (id) {
  return (await this.getUsers())[id];
}

module.exports.getUsers = async function () {
  var guilds = server.bot.guilds.array();
  var result = {};

  for (var guild of guilds) {
    var _guild = await server.bot.guilds.get(guild.id).fetchMembers();

    _guild.members.forEach((v, k) => result[k] = v);
  }

  return result;
}