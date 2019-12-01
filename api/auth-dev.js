const auth = require("./auth");

module.exports = async function (data) {
  if (process.env.PROJECT_INVITE) return data.res.sendStatus(200);
  return auth(data, true);
}