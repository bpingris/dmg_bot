const Twit = require("twit");
const http = require("./http");
const dl = require("./downloader");

const T = new Twit({
  consumer_key: process.env.API_CONSUMER_KEY,
  consumer_secret: process.env.API_CONSUMER_SECRET,
  access_token: process.env.API_ACCESS_TOKEN,
  access_token_secret: process.env.API_ACCESS_TOKEN_SECRET,
  timeout_ms: 60 * 1000
});

module.exports = {
  async tweetPost(post) {
    try {
      const { score, preview, created, author, permalink, title } = post.get();
      let imageURL = preview.images[0].source.url;
      imageURL = imageURL.replace("&amp;", "&");

      const b64content = await dl.b64(imageURL, { created, score });

      T.post(
        "media/upload",
        { media_data: b64content },
        (err, data, response) => {
          var mediaIdStr = data.media_id_string;
          var altText = title;
          var meta_params = {
            media_id: mediaIdStr,
            alt_text: { text: altText }
          };

          T.post(
            "media/metadata/create",
            meta_params,
            (err, data, response) => {
              if (!err) {
                var params = {
                  status: `${title} - ${author}\nhttps://www.reddit.com/${permalink}`,
                  media_ids: [mediaIdStr]
                };

                T.post("statuses/update", params, (err, data, response) => {
                  //   console.log(data);
                });
              }
            }
          );
        }
      );
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }
};
