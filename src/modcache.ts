import { TextChannel } from "discord.js";
import { Request } from "express-serve-static-core";
import request from "request-promise";
import * as server from ".";
import * as config from "../config.json";
import * as data from "./data";
import * as mods from "./mods";

export type Domain = "subnautica" | "subnauticabelowzero";
type CachedMod = {
  domain: Domain,
  id: string,
  name: string,
  description: string,
  image: string,
  savedate?: number,
  [key: string]: any,
}

var lastUpdate: number;

/** Updates the mod cache with the latest information from NexusMods */
export async function update() {
  if (lastUpdate && lastUpdate + 300000 > Date.now()) return;
  lastUpdate = Date.now();

  var updates1 = await request(`https://api.nexusmods.com/v1/games/subnautica/mods/updated.json?period=1d`, {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(updates1);
  updates1 = JSON.parse(updates1.body);
  await updateGame(updates1, "subnautica");

  var updates2 = await request(`https://api.nexusmods.com/v1/games/subnauticabelowzero/mods/updated.json?period=1d`, {
    headers: {
      "apikey": process.env.NEXUS_TOKEN,
    },
    resolveWithFullResponse: true,
  });
  rateLimitUpdate(updates2);
  updates2 = JSON.parse(updates2.body);
  await updateGame(updates2, "subnauticabelowzero");
}

/** Gets all cached mods */
export function getAllCached(): CachedMod[] {
  return data.getObjects("cache");
}

/** Caches all mods */
export async function cacheAll() {
  for (var mod of mods.getMods()) {
    await cache(mod.domain, mod.id);
  }
}

/** Caches a mods */
export async function cache(domain: Domain, modid: string) {
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

/** Caches all recent updates on a game */
export async function updateGame(updates: { mod_id: string, latest_mod_activity: number }[], domain: Domain) {
  var mappedmods = mods.getMods().map(mod => mod.domain + "_" + mod.nexusid);
  for (var update of updates) {
    if (!mappedmods.includes(domain + "_" + update.mod_id)) continue;
    if (needsRecache(domain, update.mod_id, update.latest_mod_activity)) cache(domain, update.mod_id);
  }
}

function getFromCache(domain: Domain, modid: string): CachedMod {
  return data.getObject("cache", domain + "_" + modid);
}

function saveInCache(domain: Domain, modid: string, modData: CachedMod) {
  modData.savedate = Date.now();
  data.setObject("cache", domain + "_" + modid, modData);
}

function needsRecache(domain: Domain, modid: string, updatedate: number) {
  var mod = getFromCache(domain, modid);
  if (!mod) return true;
  if (updatedate * 1000 > (mod.savedate ?? -1)) return true;
  return false;
}

function rateLimitUpdate(req: Request) {
  console.log(req.headers["x-rl-daily-remaining"] + " requests remaining");
  if (req.headers["x-rl-daily-remaining"] as any % 100 == 0) sendRateLimitUpdate("daily", req.headers["x-rl-daily-remaining"]);
}

function sendRateLimitUpdate(type: string, number: any) {
  var extra = "";
  if (number <= 500) extra = "<@183249892712513536> ";
  (server.bot.channels.cache.get(config.LogChannelID) as TextChannel).send(extra + "API key has " + number + " " + type + " requests remaining.");
}