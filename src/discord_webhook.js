const request = require('request-promise');

const url = "https://discordapp.com/api/webhooks/588780191384600579/E7o8fgiFoKsg7VU27JqsklcRvtUR89LqtoOylV6QnS56VHZLwY4dgvR982SDZqfvqclF";

/**
 * Sends an error in the log channel using a webhook
 * @param {Error} _error_discord The discord error, if applicable
 * @param {Error} _error_db The database error, if applicable
 */
function initError(_error_discord, _error_db) {
    var formdata = {
        embeds: [{
            title: 'The app could not be initialized!',
            type: 'rich',
            color: 14680064
        }]
    };
    if (_error_discord) {
        var __error;
        var __stack = _error_discord.stack.replace(/[ ]{2,}/ig, '');
        //var __stack = 'This    is a test    \n     message with a lot of      whitespaces'.replace(/[ ]{2,}/ig,' ');
        if (__stack.length <= 1024) {
            __error = {
                title: 'Error while initializing Discord Bot',
                type: 'rich',
                color: 14680064,
                fields: [{
                    name: 'Type',
                    value: '' + _error_discord.name
                }, {
                    name: 'Message',
                    value: '' + _error_discord.message
                }, {
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
                }, {
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
        var __stack = _error_db.stack.replace(/[ ]{2,}/ig, '');
        if (__stack.length <= 1024) {
            __error = {
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
            __error = {
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

        }

        if (__error) formdata.embeds.push(__error);
    }
    var _formData = JSON.stringify(formdata);
    //console.log(_formData);
    //return;
    var _contentLength = _formData.length;
    //console.log(data);
    request.post({
        uri: url,
        body: _formData,
        headers: {
            'Content-Type': 'application/json'
        }
    }).then().catch(ex => {
        console.error(ex);
    });
};

module.exports.initError = initError;