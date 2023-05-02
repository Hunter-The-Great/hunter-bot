const { Events } = require("discord.js");

const name = Events.MessageCreate;

const execute = async (message) => {
    if (message.content.toLowerCase() === "hello there") {
        await message.channel.send("General Kenobi");
    }
};

module.exports = {
    name,
    execute,
};
