const { Redis } = require("@upstash/redis");
require("isomorphic-fetch");

const redis = new Redis({ url: process.env.UURL, token: process.env.UTOK });

module.exports = {
    redis,
};
