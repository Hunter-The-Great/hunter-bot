const { Events } = require("discord.js");

const name = Events.MessageCreate;

const execute = async (message) => {
    if (message.content.toLowerCase() === "hello there") {
        try {
            await message.channel.send("General Kenobi");
        } catch (err) {
            console.error("An error has ocurred.", err);
        }
    }
};

module.exports = {
    name,
    execute,
};
