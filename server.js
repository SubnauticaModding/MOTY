const betterSqlite3 = require('better-sqlite3');
const Discord = require('discord.js');
const express = require('express');
const fs = require('fs');
const http = require('http');
const moment = require('moment-timezone');
const path = require('path');

const auth = require('./src/auth');
const discord = require('./src/discord');

const web = express();
web.set("views", __dirname);
web.use(require('cookie-parser')());
web.use(require('body-parser').json());
web.use(require('body-parser').urlencoded({
  extended: false
}));
web.listen(process.env.PORT);

module.exports.bot = new Discord.Client({
  fetchAllMembers: true,
});
module.exports.db = betterSqlite3('data/login.db');

this.bot.login(process.env.DISCORD_TOKEN);

web.all('*', async (req, res) => {
  var {
    authUserID,
    authSession
  } = auth.getCookies(req);
  var user = await discord.getUser(authUserID);

  if (fs.existsSync(path.join(__dirname, "/api/", req.path + ".js"))) {
    return require('./' + path.join('api/', req.path))({
      authSession,
      authUserID,
      res,
      req,
      user,
    });
  }
  
  if (/[\s\S]*?.[html|css|js|ico|ttf|png|jpg]$/g.test(req.path)) {
    return res.sendFile(path.join(__dirname, req.path));
  }
  
  if (new Date(Date.now()) < moment("2019-12-01T00:00:00Z").tz("UTC")._d) {
    return res.render("www/html/timer.ejs", {
      timer: moment("2019-12-01T00:00:00Z").tz("UTC")._d.toString(),
      message: false,
    });
  }
  
  if (new Date(Date.now()) > moment("2020-01-01T00:00:00Z").tz("UTC")._d) {
    return res.render("www/html/timer.ejs", {
      message: "The event has ended.",
    });
  }
  
  res.sendStatus("200");
});

setInterval(() => {
  http.get(`http://sn-moty.glitch.me/`);
}, 260000);
