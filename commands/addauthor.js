const authors = require("../src/authors");

module.exports = function (message, command, args) {
  authors.setAuthor(args[0], JSON.parse(args[1]), args[2], args[3]);
  message.channel.send(`Added author\nID: ${args[0]}\nDiscord IDs:${JSON.stringify(JSON.parse(args[1]))}\nName: ${args[2]}\nIcon URL: ${args[3]}`);
}                