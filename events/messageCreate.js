const { Events } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.content.toLowerCase() === "hello there") {
            message.channel.send("General Kenobi");
        }
    },
};
