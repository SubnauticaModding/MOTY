/**
 * Gets information about a mod from nexusmods.com
 * @param {string} game The domain name of the game
 * @param {string|number} id The id of the mod
 * @returns {{name:string,image:string,description:string}}
 */
async function getModInfo(game, id) {
  var response = await fetch("http://api.nexusmods.com/v1/games/" + game + "/mods/" + id + ".json", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.NEXUS_TOKEN
    }
  });
  var object = await response.json();

  if (Number.parseInt(response.headers["x-rl-daily-remaining"]) == 0)
    console.error("API KEY HAS NO MORE REQUESTS AVAILABLE!");

  var result = {};
  result.name = object.name;
  result.image = object.picture_url;
  result.description = object.summary;

  return result;
}

module.exports.getModInfo = getModInfo;