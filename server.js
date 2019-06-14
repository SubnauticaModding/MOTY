const cmd = require("node-cmd");
const crypto = require("crypto");
const request = require('request-promise');
const http = require("http");
const https = require("https");
const express = require('express');
const Discord = require('discord.js');
const config = require("./config.json");
const util = require('./util.js');
const sql = require('better-sqlite3');
const fs = require('fs');
const querystring = require('querystring');

var _running = false;
var _running_web = false;
var _running_discord = false;
var _running_db = false;

var web = express();
var web_fallback = express();
var bot= new Discord.Client();
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
    if (!fs.existsSync(__dirname + '/dbcreated')) {
        try {
            if (fs.existsSync(__dirname + '/db.db')) fs.unlinkSync(__dirname + '/db.db');
            fs.writeFileSync(__dirname + '/dbcreated');
            _running_db = true;
        } catch (ex) {
            _bootcrash = true;
            _error_db = ex;
        }
    } else {
        try {
            database = new sql('db.db');
            _running_db = true;
        } catch (ex) {
            _bootcrash = true;
            _error_db = ex;
        }
    }
    _bootcrash = true;
    if (_bootcrash) {
        if (_running_discord) {
            fallback_bot();
            var _embed = {
                title: 'The app could not be initialized!',
                type: 'rich',
                color: 14680064
            };
            var _db_e;
            if (_error_db) {
                var __stack = _error_db.stack.replace(/[ ]{2,}/ig, '');
                if (__stack.length <= 1024) {
                    _db_e = {
                        title: 'Error while initializing Database',
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_db.name
                        }, {
                            name: 'Message',
                            value: '' + _error_db.message
                        }, {
                            name: 'Stacktrace',
                            value: '' + __stack
                        }]
                    };
                } else if (__stack.length <= 2048) {
                    _db_e = {
                        title: 'Error while initializing Database',
                        description: '' + __stack,
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_db.name
                        }, {
                            name: 'Message',
                            value: '' + _error_db.message
                        }]
                    };
                } else {
                    _db_e = {
                        title: 'Error while initializing Database',
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_db.name
                        }, {
                            name: 'Message',
                            value: '' + _error_db.message
                        }, {
                            name: 'Stacktrace',
                            value: 'The Stacktrace is too long. Please see the log for more details.'
                        }]
                    };
                }
            }
            bot.channels.get(config.consoleChannelID).send({embed: _embed}).then((__m) => {
                if (_db_e) __m.channel.send({embed: _db_e});
            });
        } else {
            var formdata = {
                embeds:[{
                    title: 'The app could not be initialized!',
                    type: 'rich',
                    color: 14680064
                }]
            };
            if (_error_discord) {
                var __error;
                var __stack = _error_discord.stack.replace(/[ ]{2,}/ig,'');
                //var __stack = 'This    is a test    \n     message with a lot of      whitespaces'.replace(/[ ]{2,}/ig,' ');
                if (__stack.length <= 1024) {
                    __error = {
                        title: 'Error while initializing Discord Bot',
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_discord.name
                        },{
                            name: 'Message',
                            value: '' + _error_discord.message
                        },{
                            name: 'Stacktrace',
                            value: '' + __stack
                        }]
                    };
                } else if (__stack.length <= 2048) {
                    __error = {
                        title: 'Error while initializing Discord Bot',
                        description: '' + __stack,
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_discord.name
                        },{
                            name: 'Message',
                            value: '' + _error_discord.message
                        }]
                    };
                } else {

                }

                if (__error) formdata.embeds.push(__error);
            }
            if (_error_db) {
                var __error;
                var __stack = _error_db.stack.replace(/[ ]{2,}/ig,'');
                if (__stack.length <= 1024) {
                    __error = {
                        title: 'Error while initializing Database',
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_db.name
                        },{
                            name: 'Message',
                            value: '' + _error_db.message
                        },{
                            name: 'Stacktrace',
                            value: '' + __stack
                        }]
                    };
                } else if (__stack.length <= 2048) {
                    __error = {
                        title: 'Error while initializing Database',
                        description: '' + __stack,
                        type: 'rich',
                        color: 14680064,
                        fields: [{
                            name: 'Type',
                            value: '' + _error_db.name
                        },{
                            name: 'Message',
                            value: '' + _error_db.message
                        }]
                    };
                } else {

                }

                if (__error) formdata.embeds.push(__error);
            }
            var _formData = JSON.stringify(formdata);
            //console.log(_formData);
            //return;
            var _contentLength = _formData.length;
            //console.log(data);
            request.post({
                uri: "https://discordapp.com/api/webhooks/588780191384600579/E7o8fgiFoKsg7VU27JqsklcRvtUR89LqtoOylV6QnS56VHZLwY4dgvR982SDZqfvqclF",
                body: _formData,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(async body => {
            }).catch(ex => {
                console.error(ex);
            });
        }
        web_fallback.listen(process.env.PORT, () => {console.debug(`Fallback server running on port ${process.env.PORT}`)});
    }
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
        setInterval(function () {
            bot.user.setStatus('dnd');
            bot.user.setActivity('ERROR');
        }, 1000);
    } catch (ex) {

    }
}

web.get('*', async (req, res) => {
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

web.post('*', async (req, res) => {
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