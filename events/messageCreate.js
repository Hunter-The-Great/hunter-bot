const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");
const fetch = require("isomorphic-fetch");

const name = Events.MessageCreate;

const execute = async (message) => {
    try {
        /*
        if (
            message.content.includes(
                "The Thermal DMR is a semi automatic, fast-firing rifle that shoots quick-moving projectiles. It has a large magazine and can deal quick successive damage over range. It features a low-power scope with toggleable thermal vision. Stats: The Thermal DMR uses Medium Ammo and has a headshot multiplier of 1.65x. The Thermal DMR is a Fast Moving Projectile weapon, with a scope. There is no falloff damage on the DMR's projectiles. The Thermal DMR cannot reload whilst aiming. Strategy Guide: When using this weapon, bare in mind that you have traded raw damage output for the ability to scout out for players easier. Enemies using the Twin Mag Assault Rifle can outplay you from longer ranges, due to their gun being hitscan and yours not. Use the scope's thermal vision to pick out enemies that you may not have been able to see otherwise. The Thermal DMR excels at medium to longer ranges, so it is ideal to keep a closer ranged weapon for close quarters engagements. If you have been cornered and do not have other weapon in your hand, remember that Thermal DMR fires only slightly slower than most assault rifles, thus can be used at close range, though ineffectively. Consider the range you engage an enemy, you may need to predict your ballistics when firing at a moving target. Despite the high fire rate, you should fire more slowly when taking an enemy on a distance as to not waste ammo trying to control the wild recoil. History: Chapter 4 Season 3 - Update v25.00: Introduced the Thermal DMR in Common to Mythic."
            )
        ) {
            message.delete();
        }
        */
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
