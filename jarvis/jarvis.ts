import { Message } from "discord.js";
import fs from "fs";
import { prisma } from "../utilities/db";
import { sentry } from "../utilities/sentry";

const executeJarvis = async (message: Message) => {
    try {
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

        const shadowCheck = message.content
            .toLowerCase()
            //@ts-ignore
            .replaceAll('"', "")
            .replaceAll(",", "")
            .replaceAll(".", "");
        if (
            shadowCheck ===
            "jarvis search shadow h in gifs then click on the first one"
        ) {
            await message.channel.send(initialResponse);
            // 10 second delay
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await message.channel.send(
                "https://tenor.com/view/jarvis-shadow-h-iron-man-sped-up-gif-24172792"
            );
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
                //@ts-ignore
                .replaceAll(",", "")
                .replaceAll('"', "");
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
            } else if (
                alias.toLowerCase() === "l l prime" ||
                alias.toLowerCase() === "prime l l"
            ) {
                const data = fs.readFileSync("resources/l-prime.txt", "utf8");
                await message.channel.send(data);
                return;
            } else if (alias.toLowerCase() === "w w") {
                const data = fs.readFileSync("resources/w.txt", "utf8");
                await message.channel.send(data);
                return;
            }
            const result = await prisma.gif.findFirst({
                where: {
                    uid: message.author.id,
                    alias: { search: alias.split(" ").join(" & ") },
                },
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
        console.log(err);
        sentry.captureException(err);
    }
};

export { executeJarvis };
