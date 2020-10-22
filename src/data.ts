import * as fs from "fs";
import readdir from "fs-readdir-recursive";
import * as path from "path";

/** Gets an object from the database */
export function getObject(folder: string, file: string) {
  try {
    return JSON.parse(fs.readFileSync(path.join(__dirname, "../data/", folder, file + ".json"), "utf-8"));
  } catch { }
};

/** Gets all objects in a folder from the database */
export function getObjects(folder: string): any[] {
  try {
    var objs: any[] = [];

    var p = path.join(__dirname, "../data/", folder);
    var files = readdir(p).filter(f => f.endsWith(".json"));

    for (var f of files) {
      var json = JSON.parse(fs.readFileSync(path.join(p, f), "utf-8"));
      objs.push(json);
    }

    return objs;
  } catch (e) { return []; }
};

/** Adds or replaces an object in the database */
export function setObject(folder: string, file: string, data: any) {
  fs.writeFileSync(path.join(__dirname, "../data/", folder, file + ".json"), JSON.stringify(data, undefined, 2));
};

/** Removes an object from the database */
export function removeObject(folder: string, file: string) {
  fs.unlinkSync(path.join(__dirname, "../data/", folder, file + ".json"));
};

/** Creates default data folder if they don't exist */
export function createFolders() {
  if (!fs.existsSync(path.join(__dirname, "../data"))) fs.mkdirSync(path.join(__dirname, "../data"));
  if (!fs.existsSync(path.join(__dirname, "../data/authors"))) fs.mkdirSync(path.join(__dirname, "../data/authors"));
  if (!fs.existsSync(path.join(__dirname, "../data/mods"))) fs.mkdirSync(path.join(__dirname, "../data/mods"));
  if (!fs.existsSync(path.join(__dirname, "../data/cache"))) fs.mkdirSync(path.join(__dirname, "../data/cache"));
  if (!fs.existsSync(path.join(__dirname, "../data/users"))) fs.mkdirSync(path.join(__dirname, "../data/users"));
}