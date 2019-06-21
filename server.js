const dotenv = require('dotenv');
dotenv.config();

const sql = require('better-sqlite3');
const crypto = require("crypto");
const Discord = require('discord.js');
const ejs = require('ejs');
const express = require('express');
const uap = require('express-useragent');
const fs = require('fs');
const http = require("http");
const https = require("https");
const cmd = require("node-cmd");
const querystring = require('querystring');
const request = require('request-promise');

const config = require("./config.json");

const browser_checker = require('./src/browser_checker');
const dc_fallback = require('./src/discord_fallback');
const dc_webhook = require('./src/discord_webhook');
const fsutil = require('./src/fs_util')
const util = require('./src/logging_proxy');
const nexus = require('./src/nexus');

var _running = false;
var _running_web = false;
var _running_discord = false;
var _running_db = false;

var web = express();
var web_fallback = express();
web.use(uap.express());
const bot = new Discord.Client();
//var bot_fallback = dc_fallback(bot);
var database;

async function boot() {
  if (_running) return;
  var _bootcrash = false;
  var _error_discord;
  var _error_db;
  try {
    await bot.login(process.env.DISCORD_TOKEN);
    _running_discord = true;
  } catch (ex) {
    _bootcrash = true;
    _error_discord = ex;
  }
  if (!fs.existsSync(__dirname + '/data')) {
    fs.mkdirSync(__dirname + '/data');
  }
  if (!fs.existsSync(__dirname + '/data/dbcreated')) {
    try {
      if (fs.existsSync(__dirname + '/data/db.db')) fs.unlinkSync(__dirname + '/data/db.db');
      fs.writeFileSync(__dirname + '/data/dbcreated');
      _running_db = true;
    } catch (ex) {
      _bootcrash = true;
      _error_db = ex;
    }
  } else {
    try {
      database = new sql('data/db.db');
      _running_db = true;
    } catch (ex) {
      _bootcrash = true;
      _error_db = ex;
    }
  }
  //_bootcrash = true;
  if (_bootcrash) {
    if (_running_discord) {
      fallback_bot();
      //bot_fallback.sendError(config.consoleChannelID, _error_db);
      dc_fallback.sendError(bot, config.consoleChannelID, _error_db);
    } else {
      dc_webhook.initError(_error_discord, _error_db);
    }
    web_fallback.listen(process.env.PORT, () => {
      console.debug(`Fallback server running on port ${process.env.PORT}`)
    });
    return;
  }
  boot_bot();
  web.listen(process.env.PORT, () => {
    console.debug(`Web server running on port ${process.env.PORT}`)
  });
}

function boot_bot() {
  //util.enableLoggingProxy(bot);
  setInterval(function () {
    bot.user.setStatus('dnd');
    bot.user.setActivity('games until December 1st');
  }, 1000);
}

function fallback_bot() {
  try {
    bot.user.setStatus('dnd');
    bot.user.setActivity('ERROR');
    var _alarmOn = false;
    setInterval(function () {
      var _activity = "ERROR" + (_alarmOn ? " 🚨" : "");
      _alarmOn = !_alarmOn;
      bot.user.setStatus('dnd');
      bot.user.setActivity(_activity);
    }, 5000);
  } catch (ex) {

  }
}

web.get('*', async (req, res) => {
  let path = req.path;
  let agent = req.useragent;
  if (!browser_checker.check(agent.browser, agent.version)) {
    res.render(__dirname + "/www/html/browser_unsup.ejs");
    return;
  }

  if (path.match("^/$")) {
    res.sendFile(__dirname + "/www/html/coming_soon.html");
  } else if (path.match(/^\/entrytest$/i)) {
    res.render(__dirname + '/www/html/entrytest.ejs');
  } else if (path.match(/^\/cs\.gif$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FSNModding.gif');
  } else if (path.match(/^\/alterra\.png$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FAlterraLogo.png');
  } else if (path.match("^/css/.*")) {
    if (fs.existsSync(__dirname + "/www" + path)) {
      res.sendFile(__dirname + "/www" + path);
    } else {
      console.warn("Attempted to access an invalid file at `" + __dirname + "/www" + path + "`");
      res.redirect("/");
    }
  } else if (path.match("^/js/.*")) {
    if (fs.existsSync(__dirname + "/www" + path)) {
      res.sendFile(__dirname + "/www" + path);
    } else {
      console.warn("Attempted to access an invalid file at `" + __dirname + "/www" + path + "`");
      res.redirect("/");
    }
  } else if (path.match("^/fonts/.*")) {
    if (fs.existsSync(__dirname + "/www" + path)) {
      res.sendFile(__dirname + "/www" + path);
    } else {
      console.warn("Attempted to access an invalid file at `" + __dirname + "/www" + path + "`");
      res.redirect("/");
    }
  } else {
    if (fs.existsSync(__dirname + "/get" + path + ".js")) {
      eval(fsutil.bin2String(fs.readFileSync(__dirname + "/get" + path + ".js")));
    } else {
      res.redirect("/");
    }
  }
});

web.all('*', async (req, res) => {
  res.sendStatus(200);
});

web_fallback.all('*', async (req, res) => {
  res.sendStatus(500);
});

boot();
