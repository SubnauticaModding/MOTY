const cmd = require("node-cmd");
const crypto = require("crypto");
const request = require('request');
const http = require("http");
const https = require("https");
const express = require('express');
const app = express();
const Discord = require('discord.js');
const bot = new Discord.Client();
const config = require("./config.json");
const util = require('./util.js');



app.get('*', async (req, res) => {
  if (req.path.match(/^\/cs\.gif$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FSNModding.gif');
  } else if (req.path.match(/^\/alterra\.png$/i)) {
    res.redirect('https://cdn.glitch.com/578b3caa-2796-42d7-9bcb-bf1b681e8670%2FAlterraLogo.png');
  } else if (req.path.match(/^\/loadtest$/i)) {
    res.sendFile(__dirname + '/loading_test.html');
  } else {
    res.sendFile(__dirname + "/coming_soon.html");
  }
});

app.post('*', async (req, res) => {
  res.sendStatus(200);
});

const listener = app.listen(process.env.PORT, function () {
  console.log('Webserver started. Port: ' + listener.address().port);
});

bot.on('ready', () => {
  util.enableLoggingProxy(bot);
  console.log(`Logged in as ${bot.user.tag}!`);
  setInterval(function () {
    bot.user.setStatus('dnd');
    bot.user.setActivity('games until December 1st');
  }, 1000);
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

//bot.login(process.env.DISCORD_TOKEN);