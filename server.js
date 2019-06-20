const dotenv = require('dotenv');
dotenv.config();

const cmd = require("node-cmd");
const crypto = require("crypto");
const request = require('request-promise');
const http = require("http");
const https = require("https");
const express = require('express');
const Discord = require('discord.js');
const config = require("./config.json");
const util = require('./logging_proxy.js');
const sql = require('better-sqlite3');
const fs = require('fs');
const querystring = require('querystring');
const browser_checker = require('./browser_checker.js');
const dc_webhook = require('./discord_webhook.js');
const dc_fallback = require('./discord_fallback.js');
const ejs = require('ejs');
const uap = require('express-useragent');

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
      if (fs.existsSync(__dirname + '/data/db.db')) fs.unlinkSync(__dirname + '/db.db');
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
  let _p = req.path;
  let _ua = req.useragent;
  let _valid = browser_checker.check(_ua.browser, _ua.version);
  if (!_valid) {
    res.render(__dirname + "/browser_unsup.ejs");
    return;
  }
  //console.log(_ua);
  if (_p.match(/^\/cs\.gif$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FSNModding.gif');
  } else if (_p.match(/^\/alterra\.png$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FAlterraLogo.png');
  } else if (_p.match(/^\/loadtest$/i)) {
    res.sendFile(__dirname + '/loading_test.html');
  } else if (_p.match(/^\/entrytest$/i)) {
    res.render(__dirname + '/entrytest.ejs');
  } else {
    res.sendFile(__dirname + "/coming_soon.html");
  }
});

web.all('*', async (req, res) => {
  res.sendStatus(200);
});

async function getModInfo(game, id) {
  var response = await fetch("http://api.nexusmods.com/v1/games/" + game + "/mods/" + id + ".json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXUS_TOKEN
    }
  });
  var object = await response.json();

  if (Number.parseInt(response.headers["x-rl-daily-remaining"]) == 0)
    console.error("API KEY HAS NO MORE REQUESTS AVAILABLE!");

  var result = {};
  result.name = object.name;
  result.image = object.picture_url;

  return result;
}

web_fallback.all('*', async (req, res) => {
  res.sendStatus(500);
});

boot();