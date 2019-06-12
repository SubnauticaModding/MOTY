const cmd = require("node-cmd");
const crypto = require("crypto");
const request = require('request');
const http = require("http");
const https = require("https");
const express = require('express');
const app = express();
const Discord = require('discord.js');

const bot = new Discord.Client();


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
  // If event is "push"
  if (req.path.match(/^\/gitsecret8712431974365292354262452948525742562454352654$/i)) {
    if (req.headers['x-github-event'] == "push") {
      cmd.run('chmod 777 git.sh'); /* :/ Fix no perms after updating */
      cmd.get('./git.sh', (err, data) => {  // Run our script
        if (data) console.log(data);
        if (err) console.log(err);
      });
      cmd.run('refresh');  // Refresh project
      console.log("> [GIT] Updated with origin/master");
    }
    return res.sendStatus(200);
  }
});

// listen for requests :)
const listener = app.listen(process.env.PORT, function() {
  console.log('Webserver started. Port: ' + listener.address().port);
  // TEST
});

bot.on('ready', () => {
  console.log(`Logged in as ${bot.user.tag}!`);
  setInterval( function()  {
    bot.user.setStatus('idle');
    bot.user.setActivity('games until December 1st');
  }, 1000);
});

bot.on('message', msg => {
  
});


//bot.login(process.env.DISCORD_TOKEN);