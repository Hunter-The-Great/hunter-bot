const { Events } = require("discord.js");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Hunter Bot online: logged in as ${client.user.tag}`);
    },
};
