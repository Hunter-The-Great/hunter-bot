const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");
const fetch = require("isomorphic-fetch");

const name = Events.MessageCreate;

const execute = async (message) => {
    try {
        if (message.author.id === process.env.CLIENT_ID || message.author.bot) {
            return;
        }
        if (message.content.toLowerCase() === "hello there") {
            try {
                await message.channel.send("General Kenobi");
            } catch (err) {
                console.error("An error has ocurred.", err);
            }
        }

        //* Synonyms
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
        if (
            !(
                message.content.toLowerCase().startsWith("jarvis") ||
                message.content.toLowerCase().startsWith("withers")
            )
        ) {
            return;
        }
        //* Jarvis
        if (
            !(await prisma.guildSettings.findFirst({
                where: { guildID: message.guild.id },
            }))
        ) {
            return;
        }

        const jarvisStart = [
            "One moment",
            "Of course",
            "Right away",
            "As you wish",
        ];
        const jarvisEnd = [".", ", sir."];
        const withersResponse = ["It shall be done...", "As you wish..."];

        const jarvis = message.content.toLowerCase().startsWith("jarvis");

        const jarvisCheck = /^jarvis+(\W$|$)/;
        const witherCheck = /^withers+(\W$|$)/;

        if (message.content.toLowerCase().match(jarvisCheck)) {
            await message.channel.send("At your service.");
        }
        if (message.content.toLowerCase().match(witherCheck)) {
            await message.channel.send("Fate spins along as it should...");
        }

        if (message.content.toLowerCase().match(/(?:^|\W)dont|don't(?:$|\W)/)) {
            await message.channel.send(
                jarvis
                    ? "Of course not" +
                          jarvisEnd[
                              Math.floor(Math.random() * jarvisEnd.length)
                          ]
                    : "As you wish..."
            );
            return;
        }

        const request =
            /send |paste in |paste up |throw in |throw up |hit (\w)+ with |get |summon /;
        if (message.content.toLowerCase().match(request)) {
            const initialResponse = jarvis
                ? jarvisStart[Math.floor(Math.random() * jarvisStart.length)] +
                  jarvisEnd[Math.floor(Math.random() * jarvisEnd.length)]
                : withersResponse[
                      Math.floor(Math.random() * withersResponse.length)
                  ];
            await message.channel.send(initialResponse);
            // 10 second delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const alias = message.content
                .toLowerCase()
                .replace("jarvis", "")
                .replace("withers", "")
                .replace(/ a /g, " ")
                .replace(request, "")
                .replace(/in |the |me |here /g, "");
            const waifuRequest = /fine art|waifu/;
            if (message.content.toLowerCase().match(waifuRequest)) {
                const url =
                    "https://api.waifu.im/search/?&included_tags=waifu&is_nsfw=false";
                const response = await fetch(url);
                if (!response.ok) {
                    await message.channel.send(
                        "Apologies, I can't seem to find anything right now."
                    );
                    console.log(
                        "Waifu.im communication failure, code: " +
                            response.status +
                            "\n\n" +
                            response.statusText
                    );
                    return;
                }
                await message.channel.send(
                    (
                        await response.json()
                    ).images[0].url
                );
                return;
            }
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
