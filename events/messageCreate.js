const { Events } = require("discord.js");

const name = Events.MessageCreate;

const names = ["jarvis ", "alexa ", "mods "]
const inputs = ["send ", "hit us with ", "throw ", "hit me with ", "paste "]
const words = ["the ", "up the ", "in the ", "a ", "up a ", "in a "]

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
            if (!message.reference) {
                return;
            }

            if (message.author.id === process.env.CLIENT_ID) {
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
                        synonyms[Math.floor(Math.random() * synonyms.length)] +
                        " ";
                }
            }
            await message.reply({ content: newMessage });
        }
    }
    //jarvis bot
    if (message.content.toLowerCase().startsWith("jarvis") || message.content.toLowerCase().startsWith("alexa")) {
        const commas = ["",", "];
        for (x = 0; x < names.length * commas.length * inputs.length * words.length; x++) {
            const name = names[Math.floor(x / (comma.length * inputs.length * words.length))];
            const comma = commas[Math.floor((x % (comma.length * inputs.length * words.length)) / (inputs.length * words.length))];
            const input = inputs[Math.floor((x % (inputs.length * words.length)) / words.length)];
            const word = words[x % words.length];
            if (message.content.toLowerCase().startsWith(name + comma + input + word)) {
                const alias = message.content.toLowerCase().replace(name + comma + input + word, "");
                const regex = /^[A-Za-z0-9\s-_,.]+$/;
                if (!alias.match(regex) || alias.toLowerCase() === "null") {
                    await message.reply({ content: "Which one u talkin bout?" });
                    break;
                }
                const data = await prisma.gif.findFirst({ where: { uid: message.CLIENT_ID, alias } });
                if (!data) {
                    await message.reply({ content: "I aint got dat one on deck" });
                    break;
                }
                await message.reply(data.link);
                break;
            }
        }
    }
};

module.exports = {
    name,
    execute,
};
