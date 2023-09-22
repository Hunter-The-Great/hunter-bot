const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");

const name = Events.MessageCreate;

const execute = async (message) => {
    try {
        if (message.author.id === process.env.CLIENT_ID) {
            return;
        }
        if (message.content.toLowerCase() === "hello there") {
            try {
                await message.channel.send("General Kenobi");
            } catch (err) {
                console.error("An error has ocurred.", err);
            }
        }

        if (message.content.startsWith("~!")) {
            if (message.content === "~!synonyms") {
                if (!message.reference) {
                    return;
                }

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
                            synonyms[
                                Math.floor(Math.random() * synonyms.length)
                            ] + " ";
                    }
                }
                await message.reply({ content: newMessage });
            }
        }
        if (!message.content.toLowerCase().startsWith("jarvis")) {
            return;
        }

        if (
            !(await prisma.guildSettings.findFirst({
                where: { guildID: message.guild.id },
            }))
        ) {
            return;
        }
        const jarvis = /^jarvis+(\W$|$)/;
        if (message.content.toLowerCase().match(jarvis)) {
            await message.channel.send("At your service.");
        }
        const request =
            /(?:^|\W)[^dont]+send |paste in |paste up |throw in |throw up |hit (\w)+ with |get(?:$|\W)/;
        if (message.content.toLowerCase().match(request)) {
            const alias = message.content
                .toLowerCase()
                .replace("jarvis", "")
                .replace(/ a /g, " ")
                .replace(request, "")
                .replace(/in |the |me |here /g, "");
            const result = await prisma.gif.findFirst({
                where: { uid: message.author.id, alias: { search: alias } },
            });
            if (!result) {
                await message.channel.send(
                    "Apologies, I can't seem to find that one."
                );
                return;
            }
            await message.channel.send(result.link);
        }
    } catch (err) {
        console.error("An error has occurred:\n", err);
    }
};

module.exports = {
    name,
    execute,
};
