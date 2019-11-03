const data = require("./data");
const mods = require("./mods");
const request = require("request-promise");
const server = require("../server");

var lastUpdate;

module.exports.update = async function () {
  if (lastUpdate && lastUpdate + 120000 > Date.now()) return;
  lastUpdate = Date.now();

  var snupdates = await request("https://api.nexusmods.com/v1/games/subnautica/mods/updated.json?period=1d", {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(snupdates);
  snupdates = JSON.parse(snupdates.body);

  var bzupdates = await request("https://api.nexusmods.com/v1/games/subnauticabelowzero/mods/updated.json?period=1d", {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(bzupdates);

  bzupdates = JSON.parse(bzupdates.body);
  await updateGame(snupdates, "subnautica");
  await updateGame(bzupdates, "subnauticabelowzero");
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

function getFromCache(domain, modid) {
  return data.getObject("cache", domain + "_" + modid);
}

async function updateGame(updates, domain) {
  var mappedmods = mods.getMods().map(mod => mod.domain + "_" + mod.nexusid);
  for (var update of updates) {
    if (!mappedmods.includes(domain + "_" + update.mod_id)) continue;

    if (needsRecache(domain, update.mod_id, update.latest_mod_activity)) {
      var mod = await request(`https://api.nexusmods.com/v1/games/${domain}/mods/${update.mod_id}.json`, {
        headers: {
          "apikey": process.env.NEXUS_TOKEN,
        },
        resolveWithFullResponse: true,
      });
      rateLimitUpdate(mod);
      mod = JSON.parse(mod.body);

      saveInCache(domain, update.mod_id, {
        domain: domain,
        id: update.mod_id,
        name: mod.name,
        description: mod.summary,
        image: mod.picture_url
      });
    }
  }
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
  server.bot.channels.get("567009737422536903").send(extra + "API key has " + number + " " + type + " requests remaining.");
}