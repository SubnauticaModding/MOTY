module.exports = function (message, command, args) {
  eval(args.join(" "));
}