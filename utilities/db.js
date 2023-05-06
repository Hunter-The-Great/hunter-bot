const { Redis } = require("@upstash/redis");
require("isomorphic-fetch");

const redis = new Redis({
    url: process.env.UPSTASH_URL,
    token: process.env.UPSTASH_TOKEN,
});

module.exports = {
    redis,
};
