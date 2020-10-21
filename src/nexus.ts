import * as fs from "fs";
import * as path from "path";

export function getAuthors() { // TODO: Figure out return type and JSDOC
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data/nexus.json"), "utf-8"));
}