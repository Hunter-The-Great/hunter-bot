const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");
const fetch = require("isomorphic-fetch");
const fs = require("fs");

const name = Events.MessageCreate;

const execute = async (message) => {
    try {
        await prisma.message.create({
            data: {
                id: message.id,
                channel: message.channel.id,
                user: {
                    connectOrCreate: {
                        where: { id: message.author.id },
                        create: {
                            id: message.author.id,
                            username: message.author.username,
                        },
                    },
                },
                guild: {
                    connectOrCreate: {
                        where: { id: message.guild.id },
                        create: {
                            id: message.guild.id,
                        },
                    },
                },
                content: message.content,
                timestamp: new Date(message.createdTimestamp),
            },
        });
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
            !(await prisma.guild.findFirst({
                where: { id: message.guild.id },
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
        const initialResponse = jarvis
            ? jarvisStart[Math.floor(Math.random() * jarvisStart.length)] +
            jarvisEnd[Math.floor(Math.random() * jarvisEnd.length)]
            : withersResponse[
            Math.floor(Math.random() * withersResponse.length)
            ];

        const shadowCheck = message.content.toLowerCase().replaceAll("\"", "").replaceAll(",", "").replaceAll(".", "");
        console.log(shadowCheck)
        if (shadowCheck === "jarvis search shadow h in gifs then click on the first one") {
            await message.channel.send(initialResponse);
            // 10 second delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await message.channel.send("https://tenor.com/view/jarvis-shadow-h-iron-man-sped-up-gif-24172792");
            return;
        }

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
            /send |paste in |paste up |throw in |throw up |hit (\w)+ with |get |summon |search |search for /;
        if (message.content.toLowerCase().match(request)) {
            await message.channel.send(initialResponse);
            // 10 second delay
            await new Promise((resolve) => setTimeout(resolve, 1000));

            let alias = message.content
                .toLowerCase()
                .replace("jarvis", "")
                .replace("withers", "")
                .replace(/ a /g, " ")
                .replace(request, "")
                .replace(/in |the |me |here |up /g, "")
                .replaceAll(",", "")
                .replaceAll("\"", "");
            const waifuRequest = /fine art|waifu/;
            if (alias.startsWith(" ")) {
                alias = alias.slice(1);
            }
            if (alias.endsWith(" ")) {
                alias = alias.slice(0, -1);
            }
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
            } else if (alias.toLowerCase() === "l l") {
                const data = fs.readFileSync("resources/l.txt", "utf8");
                await message.channel.send(data);
                return;
            } else if (alias.toLowerCase() === "l l prime" || alias.toLowerCase() === "prime l l") {
                const data = fs.readFileSync("resources/l-prime.txt", "utf8");
                await message.channel.send(data);
                return;
            } else if (alias.toLowerCase() === "w w") {
                const data = fs.readFileSync("resources/w.txt", "utf8");
                await message.channel.send(data);
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
