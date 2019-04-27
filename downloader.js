const fs = require("fs");
const path = require("path");
const http = require("./http");

const b64 = async (url, { created, score }) => {
  const res = await http.get(url, {
    responseType: "arraybuffer"
  });
  return new Buffer(res.data, "binary").toString("base64");
};

const file = async (url, { created, score }) => {
  const out = path.resolve(__dirname, "images", `dmg-${created}_${score}.jpg`);

  const writer = fs.createWriteStream(out);
  const res = await http({
    url,
    method: "GET",
    responseType: "stream"
  });
  res.data.pipe(writer);

  writer.on("finish");
  return new Promise((res, rej) => {
    writer.on("finish", res);
    writer.on("error", rej);
  });
};

module.exports = {
  file,
  b64
};
