import * as fs from "fs";
import * as path from "path";

/** Gets the nexus data of authors */
export function getAuthors(): { [key: string]: { NexusName: string, NexusId: string, } } {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "../data/nexus.json"), "utf-8"));
}