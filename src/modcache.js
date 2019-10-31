const data = require("./data");
const mods = require("./mods");
const request = require("request-promise");
const server = require("../server");

module.exports.update = async function() {
  var snupdates = await request(
    "https://api.nexusmods.com/v1/games/subnautica/mods/updated.json?period=1d",
    {
      headers: {
        apikey: process.env.NEXUS_TOKEN
      },
      resolveWithFullResponse: true
    }
  );
  console.log(
    snupdates.headers["x-rl-daily-remaining"] + " requests remaining"
  );
  if (snupdates.headers["x-rl-daily-remaining"] % 100 == 0)
    sendUpdate("daily", snupdates.headers["x-rl-daily-remaining"]);
  snupdates = JSON.parse(snupdates.body);
  var bzupdates = await request(
    "https://api.nexusmods.com/v1/games/subnauticabelowzero/mods/updated.json?period=1d",
    {
      headers: {
        apikey: process.env.NEXUS_TOKEN
      },
      resolveWithFullResponse: true
    }
  );
  console.log(
    bzupdates.headers["x-rl-daily-remaining"] + " requests remaining"
  );
  if (bzupdates.headers["x-rl-daily-remaining"] % 100 == 0)
    sendUpdate("daily", bzupdates.headers["x-rl-daily-remaining"]);
  bzupdates = JSON.parse(bzupdates.body);
  await updateGame(snupdates, "subnautica");
  await updateGame(bzupdates, "subnauticabelowzero");
};

module.exports.getAllCached = function() {
  return data.getObjects("cache");
};

module.exports.cacheAll = async function() {
  for (var mod of mods.getMods()) {
    var modinfo = await request(
      `https://api.nexusmods.com/v1/games/${mod.domain}/mods/${mod.nexusid}.json`,
      {
        headers: {
          apikey: process.env.NEXUS_TOKEN
        },
        resolveWithFullResponse: true
      }
    );
    console.log(
      modinfo.headers["x-rl-daily-remaining"] + " requests remaining"
    );
    if (modinfo.headers["x-rl-daily-remaining"] % 100 == 0)
      sendUpdate("daily", modinfo.headers["x-rl-daily-remaining"]);
    modinfo = JSON.parse(modinfo.body);

    saveInCache(mod.domain, mod.nexusid, {
      domain: mod.domain,
      id: mod.nexusid,
      name: modinfo.name,
      description: modinfo.summary,
      image: modinfo.picture_url
    });
  }
};

function getFromCache(domain, modid) {
  return data.getObject("cache", domain + "_" + modid);
}

async function updateGame(updates, domain) {
  var mappedmods = mods.getMods().map(mod => mod.domain + "_" + mod.nexusid);
  for (var update of updates) {
    if (!mappedmods.includes(domain + "_" + update.mod_id)) continue;

    if (needsRecache(domain, update.mod_id, update.latest_mod_activity)) {
      var mod = await request(
        `https://api.nexusmods.com/v1/games/${domain}/mods/${update.mod_id}.json`,
        {
          headers: {
            apikey: process.env.NEXUS_TOKEN
          },
          resolveWithFullResponse: true
        }
      );
      console.log(mod.headers["x-rl-daily-remaining"] + " requests remaining");
      if (mod.headers["x-rl-daily-remaining"] % 100 == 0)
        sendUpdate("daily", mod.headers["x-rl-daily-remaining"]);
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
  if (updatedate > mod.savedate) return true;
  return false;
}

function sendUpdate(type, number) {
  var extra = "";
  if (number <= 500) extra = "<@183249892712513536> ";
  server.bot.channels
    .get("567009737422536903")
    .send(
      extra + "API key has " + number + " " + type + " requests remaining."
    );
}
