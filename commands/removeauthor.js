const authors = require("../src/authors");

module.exports = function (message, command, args) {
  authors.removeAuthor(args[0]);
  message.channel.send(`**Removed author**\nID: \`${args[0]}\``);
}