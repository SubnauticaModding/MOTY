import * as data from "./data";

export type Mod = {
  id: string,
  domain: "subnautica" | "subnauticabelowzero",
  nexusid: string,
  authors: string,
};

/** Gets a mod from the database by its id */
export function getMod(modId: string): Mod {
  return data.getObject("mods", modId);
};

/** Gets all mods from the database */
export function getMods(): Mod[] {
  return data.getObjects("mods");
};

/** Removes a mod from the database by its id */
export function removeMod(modId: string) {
  data.removeObject("mods", modId);
};

/** Adds or replaces a mod in the database */
export function setMod(modId: string, domain: "subnautica" | "subnauticabelowzero", nexusID: string, authors: string) {
  setModObject({
    id: modId,
    domain: domain,
    nexusid: nexusID,
    authors: authors,
  });
};

/** Adds or replaces a mod in the database */
export function setModObject(object: Mod) {
  data.setObject("mods", object.id, object);
}