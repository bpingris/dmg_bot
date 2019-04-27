require("dotenv").config();
const Cronjob = require("cron").CronJob;

const http = require("./http");
const myTwitter = require("./twitter");
const { EACH_HOUR, OPTIONS, URL } = require("./constants");

const getRedditHotPosts = async () => {
  const res = await http.get(URL);
  return res.data.data.children;
};

const Post = data => {
  const { score, preview, created, author, title, permalink } = data.data;
  return {
    log() {
      console.log(score);
      console.log(preview);
      console.log(created);
      console.log(author);
      console.log(title);
      console.log(permalink);
    },
    get() {
      return { score, preview, created, author, title, permalink };
    }
  };
};

const MakePosts = data => data.map(Post);

const processPostsToArray = async () => MakePosts(await getRedditHotPosts());

const prepareToTweet = async posts => {
  if (posts.length === 0) {
    console.log("No more posts...");
    console.log("Fetching new posts...");
    posts = await processPostsToArray();
    console.log("Done.");
  }
  console.log("Posting a tweet...");
  const res = await myTwitter.tweetPost(posts.pop());
  if (res.success) {
    console.log("Done.");
  } else {
    console.log("An error occured");
    console.log(res.error);
  }
  return posts;
};

const main = async () => {
  console.log("Launching app...");
  console.log("Fetching new posts...");
  let posts = await processPostsToArray();
  console.log("Done.");

  posts = await prepareToTweet(posts);

  setInterval(async () => {
    posts = await prepareToTweet(posts);
  }, 1000 * 60 * 60);
};

main();
