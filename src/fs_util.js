/**
 * Turns a character array into a string
 * @param {number[]} array The character array
 * @returns {string}
 */
function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

module.exports.bin2String = bin2String;