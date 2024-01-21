const { prisma } = require("./utilities/db");
const fastify = require("fastify")({ logger: false });
const cors = require("@fastify/cors");
const { EmbedBuilder } = require("discord.js");

const start = async (client) => {
    await fastify.register(cors, {
        origin: "*",
    });

    fastify.post("/reminders", async (request, res) => {
        //* -------------------------------------------------------------------------------------------- /reminders
        if (request.body.key !== process.env.KEY) {
            console.log("Invalid key for /reminders.");
            return res.code(401).send({ message: "Invalid Key" });
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return res.code(200).send({ message: "Acknowledged." });
    });

    fastify.post("/message", async (request, res) => {
        //* -------------------------------------------------------------------------------------------- /message
        if (request.body.key !== process.env.MESSAGE_KEY) {
            console.log("Invalid key for /message.");
            return res.code(401).send({ message: "Invalid Key" });
        }
        const { channelID, message } = request.body;

        const channel = await client.channels.fetch(channelID);

        //TODO check if valid channel??
        console.log(channel);

        await channel.send(message);
        return res.code(200).send({ message: "Acknowledged." });
    });

    fastify.post("/gh/:uid/:discriminator", async (request, res) => {
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
        return res.code(200).send({ message: "Acknowledged." });
    });

    fastify.post("/drewh", async (request, res) => {
        //* -------------------------------------------------------------------------------------------- /drewh
        if (request.body.key !== process.env.DREW_KEY) {
            console.log("Invalid key for /drewh.");
            return res.code(401).send({ message: "Invalid Key" });
        }
        const drew = await client.users.fetch(process.env.DREW_ID);
        await drew.send(request.body.message);
        return res.code(200).send({ message: "Acknowledged." });
    });

    fastify.post("/coolthing", async (request, res) => {
        await client.channels
            .fetch(process.env.COOL_CHANNEL)
            .then((channel) => {
                channel.send(
                    `${request.body.user ?? "SOMEONE"} FOUND THE COOL THING!`
                );
            });
        return res.code(200).send({ message: "Cool thing acknowledged." });
    });

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
