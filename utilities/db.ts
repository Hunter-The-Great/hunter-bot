const { Redis } = require("@upstash/redis");
require("isomorphic-fetch");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const redis = new Redis({
    url: process.env.UPSTASH_URL,
    token: process.env.UPSTASH_TOKEN,
});

module.exports = {
    redis,
    prisma,
};
