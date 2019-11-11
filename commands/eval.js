module.exports = function (message, command, args) {
  if (message.author.id != "183249892712513536") return;
  eval(args.join(" "));
}