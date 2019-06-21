const Discord = require('discord.js');

module.exports.sendError = (bot,_channel, _error_db) => {
    try {
        if (bot) {
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
            let channel = bot.channels.get('588205756361342993');
            channel.send({
                embed: _embed
            }).then((message) => {
                if (_db_e) channel.send({
                    embed: _db_e
                });
            });
        }
    } catch (ex) {
        console.error(ex);
    }
};

/*
module.exports = (_bot) => {
    var _v = {
        bot: null,
        sendError: (_channel, _error_db) => {
            try {
                if (_v.bot) {
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
                    let _c = _v.bot.channels.get('588205756361342993');
                    _c.send({embed: _embed}).then((__m) => {
                        if (_db_e) _c.send({embed: _db_e});
                    });
                }
            } catch (ex) {
                console.error(ex);
            }
        }
    };
    _v.bot = _bot;
    return _v;
}
 */

/*
const _def = {
    bot: null,
    test: () => {
        if (this.bot) console.log("TEST SUCCESSFUL");
    }
};

module.exports = (_bot) => {
    var _v = _def.valueOf();
    _v.bot = _bot;
    return _v;
}
*/