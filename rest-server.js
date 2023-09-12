const { prisma } = require("./utilities/db");
const fastify = require("fastify")({ logger: false });
const cors = require("@fastify/cors");
const { EmbedBuilder } = require("discord.js");

const start = async (client) => {
    await fastify.register(cors, {
        origin: "*",
    });

    fastify.post("/reminders", async (request) => {
        //* -------------------------------------------------------------------------------------------- /reminders
        if (request.body.key !== process.env.KEY) {
            console.log("Invalid key for /reminders.");
            return { status: "Invalid key." };
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return { status: "Acknowledged." };
    });

    fastify.post("/message", async (request) => {
        //* -------------------------------------------------------------------------------------------- /message
        if (request.body.key !== process.env.MESSAGE_KEY) {
            console.log("Invalid key for /message.");
            return { text: "Invalid key." };
        }
        const { channelID, message } = request.body;

        const channel = await client.channels.fetch(channelID);

        //TODO check if valid channel??

        await channel.send(message);
        return { status: "Acknowledged." };
    });

    fastify.post("/gh/:uid/:discriminator", async (request) => {
        //* -------------------------------------------------------------------------------------------- /gh
        const { uid, discriminator } = request.params;
        const user = await client.users.fetch(uid);

        const webhook = await prisma.GitHubWebhook.findFirst({
            where: { uid, discriminator },
        });
        const embed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle(
                request.body.repository.full_name ||
                    "Could not find repository information."
            )
            .setDescription(
                request.body.head_commit.message ||
                    "Could not find commit message."
            )
            .addFields([
                {
                    name: "Commit",
                    value:
                        `[${request.body.head_commit.id.slice(0, 7)}](${
                            request.body.head_commit.url
                        })` || "Could not find commit information.",
                    inline: true,
                },
                {
                    name: "Author",
                    value:
                        `[${request.body.sender.login}](${request.body.sender.url})` ||
                        "Could not find author information.",
                    inline: true,
                },
                {
                    name: "Branch",
                    value:
                        request.body.ref ||
                        "Could not find branch information.",
                    inline: true,
                },
                {
                    name: "Timestamp",
                    value:
                        request.body.head_commit.timestamp ||
                        "Could not find timestamp.",
                    inline: true,
                },
            ]);
        if (webhook.channelID === "0") {
            await user.send({ embeds: [embed] });
        } else {
            const channel = await client.channels.fetch(webhook.channelID);
            await channel.send({ embeds: [embed] });
        }
        return { status: "Acknowledged." };
    });

    fastify.post("/drewh", async (request) => {
        //* -------------------------------------------------------------------------------------------- /drewh
        if (request.body.key !== process.env.DREW_KEY) {
            console.log("Invalid key for /drewh.");
            return { status: "Invalid key." };
        }
        const drew = await client.users.fetch(process.env.DREW_ID);
        await drew.send(request.body.message);
        return { status: "Acknowledged." };
    });

    /* In case Drew ever makes that plugin
    fastify.post("/mc", async (request) => {
        // -------------------------------------------------------------------------------------------- /mc
        if (request.body.key !== process.env.MC_KEY) {
            console.log("Invalid key for /mc.");
            return "Invalid key.";
        }

        const channel = await client.channels.fetch(process.env.MC_CHANNEL_ID);
        if (request.body.type === "join") {
            // -------------------------------------------------------------------------------------------- join
            await channel.send(
                `**${request.body.username}** joined the server.`
            );
        } else if (request.body.type === "leave") {
            // -------------------------------------------------------------------------------------------- leave
            await channel.send(`**${request.body.username}** left the server.`);
        }

        return "Acknowledged.";
    });
    */

    //* running the server
    try {
        fastify.listen({ host: "0.0.0.0", port: process.env.PORT });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

module.exports = {
    start,
};
