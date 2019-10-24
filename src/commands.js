const read = require("fs-readdir-recursive");

const server = require("../server");

module.exports = function () {
  server.commands = {};
  
  var files = read('./commands/').filter(f => f.endsWith(".js"));

  for (var f of files) {
    const props = require(`../commands/${f}`);
    server.commands[f.substring(0, f.length - 3)] = props;
  }
}