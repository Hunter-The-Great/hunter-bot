const { Redis } = require("@upstash/redis");

const redis = new Redis({ url: process.env.UURL, token: process.env.UTOK });

module.exports = {
    redis,
};
