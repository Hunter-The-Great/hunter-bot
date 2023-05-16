const { Events } = require("discord.js");

const name = Events.ClientReady;

const once = true;

const execute = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
};

module.exports = {
    name,
    once,
    execute,
};
