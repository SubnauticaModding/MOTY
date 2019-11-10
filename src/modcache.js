const request = require("request-promise");

const data = require("./data");
const mods = require("./mods");
const server = require("../server");

var lastUpdate;

module.exports.update = async function () {
  if (lastUpdate && lastUpdate + 300000 > Date.now()) return;
  lastUpdate = Date.now();

  var updates1 = await request(`https://api.nexusmods.com/v1/games/${process.env.NEXUS_DOMAIN_1}/mods/updated.json?period=1d`, {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(updates1);
  updates1 = JSON.parse(updates1.body);
  await this.updateGame(updates1, process.env.NEXUS_DOMAIN_1);

  if (process.env.NEXUS_DOMAIN_2) {
    var updates2 = await request(`https://api.nexusmods.com/v1/games/${process.env.NEXUS_DOMAIN_2}/mods/updated.json?period=1d`, {
      headers: {
        "apikey": process.env.NEXUS_TOKEN,
      },
      resolveWithFullResponse: true,
    });
    rateLimitUpdate(updates2);
    updates2 = JSON.parse(updates2.body);
    await this.updateGame(updates2, process.env.NEXUS_DOMAIN_2);
  }
}

module.exports.getAllCached = function () {
  return data.getObjects("cache");
}

module.exports.cacheAll = async function () {
  for (var mod of mods.getMods()) {
    var modinfo = await request(`https://api.nexusmods.com/v1/games/${mod.domain}/mods/${mod.nexusid}.json`, {
      headers: {
        "apikey": process.env.NEXUS_TOKEN,
      },
      resolveWithFullResponse: true,
    });
    rateLimitUpdate(modinfo);
    modinfo = JSON.parse(modinfo.body);

    saveInCache(mod.domain, mod.nexusid, {
      domain: mod.domain,
      id: mod.nexusid,
      name: modinfo.name,
      description: modinfo.summary,
      image: modinfo.picture_url
    });
  }
}

module.exports.cache = async function (domain, modid) {
  var mod = await request(`https://api.nexusmods.com/v1/games/${domain}/mods/${modid}.json`, {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(mod);
  mod = JSON.parse(mod.body);

  saveInCache(domain, modid, {
    domain: domain,
    id: modid,
    name: mod.name,
    description: mod.summary,
    image: mod.picture_url,
  });
}

module.exports.updateGame = async function (updates, domain) {
  var mappedmods = mods.getMods().map(mod => mod.domain + "_" + mod.nexusid);
  for (var update of updates) {
    if (!mappedmods.includes(domain + "_" + update.mod_id)) continue;

    if (needsRecache(domain, update.mod_id, update.latest_mod_activity)) this.cache(domain, update.mod_id);
  }
}

function getFromCache(domain, modid) {
  return data.getObject("cache", domain + "_" + modid);
}

function saveInCache(domain, modid, moddata) {
  moddata.savedate = Date.now();
  data.setObject("cache", domain + "_" + modid, moddata);
}

function needsRecache(domain, modid, updatedate) {
  var mod = getFromCache(domain, modid);
  if (!mod) return true;
  if (updatedate * 1000 > mod.savedate) return true;
  return false;
}

function rateLimitUpdate(req) {
  console.log(req.headers["x-rl-daily-remaining"] + " requests remaining");
  if (req.headers["x-rl-daily-remaining"] % 100 == 0) sendRateLimitUpdate("daily", req.headers["x-rl-daily-remaining"]);
}

function sendRateLimitUpdate(type, number) {
  var extra = "";
  if (number <= 500) extra = "<@183249892712513536> ";
  server.bot.channels.get(process.env.DISCORD_LOG_CHANNEL).send(extra + "API key has " + number + " " + type + " requests remaining.");
}