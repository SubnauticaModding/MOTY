const server = require("../server");

var members = {};

module.exports.getUser = async function (id) {
  return (await this.getUsers())[id];
}

module.exports.getUsers = async function () {
  if (!members) {
    var guilds = server.bot.guilds.array();

    for (var guild of guilds) {
      var _guild = await server.bot.guilds.get(guild.id).fetchMembers();

      _guild.members.forEach((v, k) => members[k] = v);
    }
  }

  return members;
}