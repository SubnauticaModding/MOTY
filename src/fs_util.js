function bin2String(array) {
  return String.fromCharCode.apply(String, array);
}

module.exports.bin2String = bin2String;