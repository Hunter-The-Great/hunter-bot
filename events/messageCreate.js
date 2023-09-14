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
    if (message.content.startsWith("~!")) {
        if (message.content === "~!synonyms") {
            const thesaurus = require("thesaurus");

            const original = (
                await message.channel.messages.fetch(
                    message.reference.messageId
                )
            ).content.split(" ");

            var newMessage = "";
            for (const word of original) {
                const synonyms = thesaurus.find(word);
                if (synonyms.length === 0) {
                    newMessage += word + " ";
                } else {
                    newMessage +=
                        synonyms[Math.floor(Math.random() * synonyms.length)] +
                        " ";
                }
            }
            await message.reply({ content: newMessage });
        }
    }
};

module.exports = {
    name,
    execute,
};
