const Discord = require('discord.js');
const express = require('express');
const fs = require('fs');
const http = require('http');
const moment = require('moment-timezone');
const path = require('path');

const web = express();
web.set("views", __dirname);
web.use(require('cookie-parser')());
web.use(require('body-parser').json());
web.use(require('body-parser').urlencoded({
  extended: false
}));
web.listen(process.env.PORT);

const bot = new Discord.Client({
  fetchAllMembers: true,
});
//const db = require('better-sqlite3')('data.db');

bot.login(process.env.DISCORD_TOKEN);

web.all('*', async (req, res) => {
  if (fs.existsSync(path.join(__dirname, "/api/", req.path + ".js")))
    return require('./' + path.join('api/', req.path))();
  if (/[\s\S]*?.[html|css|js|ico|ttf|png|jpg]$/g.test(req.path))
    return res.sendFile(path.join(__dirname, req.path));
  
  res.render("www/html/timer.ejs", {
    timer: moment("2019-12-01T00:00:00Z").tz("UTC")._d.toString()
  });
});

setInterval(() => {
  http.get(`http://sn-moty.glitch.me/`);
}, 280000);