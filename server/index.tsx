import { prisma } from "../utilities/db";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { EmbedBuilder, TextChannel } from "discord.js";
import { sentry } from "../utilities/sentry";
import { FastifyReply, fastify } from "fastify";
import { BaseHtml } from "./baseHtml";
import { FeedbackHtml } from "./feedback";

export const server = fastify() as any;

export function updateSite(message: JSX.Element) {
    server.websocketServer.clients.forEach((client) => {
        client.send(message.toString());
    });
}

const start = async (client) => {
    await server.register(cors, {
        origin: "*",
    });

    await server.register(websocket);

    //     fastify.register(fastifyStatic, {
    //   root: process.cwd() + "/public",
    //   prefix: "/public/",
    // });

    server.get("/", async (req, res: FastifyReply) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(
            <BaseHtml title="Hunter Bot">
                <div class="flex h-1/2  w-full items-center justify-center">
                    <form
                        hx-post="/login"
                        hx-ext="json-enc"
                        hx-swap="outerHTML"
                        class="scale-150"
                    >
                        <label>Key: </label>
                        <input
                            type="password"
                            name="key"
                            class="rounded bg-slate-950 p-1"
                        />
                        <br />
                    </form>
                </div>
            </BaseHtml>
        );
    });

    server.get("/feedback", async (req, res: FastifyReply) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(<BaseHtml>{await (<FeedbackHtml />)}</BaseHtml>);
    });

    server.get("/pubsub", { websocket: true }, (_connection) => {});

    server.post("/reminders", async (request, res) => {
        if (request.body.key !== process.env.KEY) {
            console.log("Invalid key for /reminders.");
            return res.code(401).send({ message: "Invalid Key" });
        }

        const { uid, content } = request.body;
        const user = await client.users.fetch(uid);
        await user.send(content);
        return res.code(200).send({ message: "Acknowledged." });
    });

    server.post("/message", async (request, res) => {
        const message = request.body.message;
        const channelID = request.body.channel;
        const key = request.body.key;

        if (key !== process.env.MESSAGE_KEY) {
            return res.code(401).send({ message: "Unauthorized" });
        }

        const channel = await client.channels.fetch(channelID);

        await channel.send(message);
        return res.send(
            <div id="message" class="flex justify-center items-end">
                <textarea
                    name="message"
                    class="resize max-h-48 max-w-lg min-w-48 min-h-16 rounded mt-1 mr-1 bg-slate-950 p-1"
                ></textarea>
                <button
                    type="submit"
                    class="bg-sky-500 hover:bg-sky-700 rounded p-1 max-h-10 min-w-20"
                >
                    Send
                </button>
            </div>
        );
    });

    server.post("/gh/:uid/:discriminator", async (request, res) => {
        const { uid, discriminator } = request.params;
        const user = await client.users.fetch(uid);

        const webhook = await prisma.gitHubWebhook.findFirst({
            where: { uid, discriminator },
        });
        if (!webhook) {
            return res.code(404).send({ message: "Endpoint not found." });
        }
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
        if (webhook.channelID === "-1") {
            await user.send({ embeds: [embed] });
        } else {
            const channel = await client.channels.fetch(webhook.channelID);
            await channel.send({ embeds: [embed] });
        }
        return res.code(200).send({ message: "Acknowledged." });
    });

    server.post("/drewh", async (request, res) => {
        if (request.body.key !== process.env.DREW_KEY) {
            console.log("Invalid key for /drewh.");
            return res.code(401).send({ message: "Invalid Key" });
        }
        const drew = await client.users.fetch("254591447284711424");
        await drew.send(request.body.message);
        return res.code(200).send({ message: "Acknowledged." });
    });

    server.post("/coolthing", async (request, res) => {
        await client.channels.fetch("1198755163612119163").then((channel) => {
            channel.send(
                `${request.body.user ?? "SOMEONE"} ${
                    request.body.code ? `(${request.body.code}) ` : ""
                }FOUND THE COOL THING!`
            );
        });
        return res.code(200).send({ message: "Cool thing acknowledged." });
    });

    server.post("/login", async (req, res: FastifyReply) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        if (req.body.key !== process.env.MESSAGE_KEY) {
            res.code(204).send({ message: "Incorrect key" });
            return;
        }
        res.send(
            <form
                hx-post="/message"
                hx-ext="json-enc"
                class="flex-col justify-center scale-150"
                hx-swap="outerHTML"
                hx-target="#message"
            >
                <div id="key">
                    <input
                        type="hidden"
                        name="key"
                        value={process.env.MESSAGE_KEY}
                    />
                </div>
                <div id="guilds">
                    <label>Guild: </label>
                    <select
                        name="guild"
                        hx-swap="outerHTML"
                        hx-target="#channels"
                        hx-post="/guild"
                        hx-ext="json-enc"
                        class="rounded bg-slate-950"
                    >
                        <option>Select a guild</option>
                        {client.guilds.cache.map((guild) => (
                            <option value={guild.id}>{guild.name}</option>
                        ))}
                    </select>
                </div>
                <div id="channels"></div>
                <div id="message"></div>
            </form>
        );
    });

    server.post("/guild", async (req, res: FastifyReply) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(
            <div id="channels">
                <label>Channel: </label>
                <select
                    name="channel"
                    hx-ext="json-enc"
                    hx-swap="outerHTML"
                    hx-target="#message"
                    hx-post="/channel"
                    class="rounded bg-slate-950"
                >
                    <option>Select a channel</option>
                    {client.guilds.cache
                        .get(req.body.guild)
                        .channels.cache.filter(
                            (channel) => channel instanceof TextChannel
                        )
                        .map((channel) => (
                            <option value={channel.id}>{channel.name}</option>
                        ))}
                </select>
            </div>
        );
    });

    server.post("/channel", async (req, res: FastifyReply) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(
            <div id="message" class="flex justify-center items-end">
                <textarea
                    name="message"
                    class="resize max-h-48 max-w-lg min-w-48 min-h-16 rounded mt-1 mr-1 bg-slate-950 p-1"
                ></textarea>
                <button
                    type="submit"
                    class="bg-sky-500 hover:bg-sky-700 rounded p-1 max-h-10 min-w-20"
                >
                    Send
                </button>
            </div>
        );
    });

    server.delete("/feedback-remove/:id", async (req, res: FastifyReply) => {
        const id = req.params.id;
        await prisma.feedback.delete({
            where: { id },
        });
        res.code(200);
    });

    //* running the server
    try {
        server.listen({ host: "0.0.0.0", port: process.env.PORT });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        sentry.captureException(err);
        server.log.error(err);
        process.exit(1);
    }
};

export { start };
