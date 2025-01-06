import { prisma } from "../utilities/db";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { EmbedBuilder, embedLength, TextChannel } from "discord.js";
import { sentry } from "../utilities/sentry";
import { FastifyReply, FastifyRequest, fastify } from "fastify";
import { BaseHtml } from "./baseHtml";
import { FeedbackHtml } from "./feedback";
import { z, ZodError, ZodSchema } from "zod";
import { FastifyRequestType } from "fastify/types/type-provider";
import { parseDate } from "chrono-node";

export const server = fastify();

export function updateSite(message: JSX.Element) {
    server.websocketServer.clients.forEach((client) => {
        client.send(message.toString());
    });
}

class VisibleError extends Error {
    code: number;
    constructor(message: string, code?: number) {
        super(message);
        this.name = "VisibleError";
        this.code = code ?? 500;
    }
}

server.setErrorHandler((err: Error, req, res) => {
    if (err instanceof ZodError) {
        console.log(err.message);
        return res.code(400).send({
            error: "Bad Request",
        });
    } else if (err instanceof VisibleError) {
        const code = err.code;
        return res.code(code).send({
            error: err.message,
        });
    }
    console.error(err);
    res.code(500).send({ error: "Internal Server Error" });
});

function useSchema<T extends ZodSchema>(
    schema: T,
    handler: (
        req: FastifyRequestType<unknown, unknown, unknown, z.infer<T>>,
        res: FastifyReply
    ) => void
) {
    return async (req: FastifyRequest, res: FastifyReply) => {
        schema.parse(req.body);
        return handler(req, res);
    };
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

    server.get("/", async (req, res) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(
            <BaseHtml title="Hunter Bot">
                <div class="flex w-full items-center justify-center text-xl">
                    <form
                        id="login"
                        hx-post="/login"
                        hx-ext="response-targets, json-enc"
                        hx-swap="outerHTML"
                        hx-target="#login"
                        hx-target-401="#login-error"
                    >
                        <label>Key: </label>
                        <input
                            type="password"
                            name="key"
                            class="rounded bg-slate-950 p-1"
                        />
                        <div id="login-error"></div>
                        <br />
                    </form>
                </div>
            </BaseHtml>
        );
    });

    server.get("/feedback", async (req, res) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(<BaseHtml>{await (<FeedbackHtml />)}</BaseHtml>);
    });

    server.get("/pubsub", { websocket: true }, (_connection) => {});

    const reminderSchema = z.object({
        key: z.string(),
        uid: z.string(),
        content: z.string(),
    });

    server.post(
        "/reminders",
        useSchema(reminderSchema, async (req, res) => {
            const { key, uid, content } = req.body;

            if (key !== process.env.KEY) {
                console.log("Invalid key for /reminders.");
                throw new VisibleError("Unauthorized", 401);
            }

            const user = await client.users.fetch(uid);
            await user.send(content);
            return res.code(200).send({ message: "Acknowledged." });
        })
    );

    const ghSchema = z.object({
        repository: z.object({
            full_name: z.string(),
        }),
        head_commit: z.object({
            message: z.string(),
            id: z.string(),
            url: z.string(),
            timestamp: z.string(),
        }),
        sender: z.object({
            login: z.string(),
            url: z.string(),
        }),
        ref: z.string(),
    });

    server.post(
        "/gh/:uid/:discriminator",
        useSchema(ghSchema, async (req, res) => {
            const ghParams = z.object({
                uid: z.string(),
                discriminator: z.string(),
            });
            const result = ghParams.safeParse(req.params);
            if (result.error) {
                throw new VisibleError(result.error.toString(), 400);
            }
            const { uid, discriminator } = result.data;
            const user = await client.users.fetch(uid);

            const webhook = await prisma.gitHubWebhook.findFirst({
                where: { uid, discriminator },
            });
            if (!webhook) {
                throw new VisibleError("Endpoint not found", 404);
            }
            const embed = new EmbedBuilder()
                .setColor(0x00ffff)
                .setTitle(
                    req.body.repository.full_name ||
                        "Could not find repository information."
                )
                .setDescription(
                    req.body.head_commit.message ||
                        "Could not find commit message."
                )
                .addFields([
                    {
                        name: "Commit",
                        value:
                            `[${req.body.head_commit.id.slice(0, 7)}](${
                                req.body.head_commit.url
                            })` || "Could not find commit information.",
                        inline: true,
                    },
                    {
                        name: "Author",
                        value:
                            `[${req.body.sender.login}](${req.body.sender.url})` ||
                            "Could not find author information.",
                        inline: true,
                    },
                    {
                        name: "Branch",
                        value:
                            req.body.ref ||
                            "Could not find branch information.",
                        inline: true,
                    },
                    {
                        name: "Timestamp",
                        value:
                            req.body.head_commit.timestamp ||
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
        })
    );

    const drewhSchema = z.object({
        key: z.string(),
        message: z.string(),
    });

    server.post(
        "/drewh",
        useSchema(drewhSchema, async (req, res) => {
            if (req.body.key !== process.env.DREW_KEY) {
                console.log("Invalid key for /drewh.");
                throw new VisibleError("Unauthorized");
            }
            const drew = await client.users.fetch("254591447284711424");
            await drew.send(req.body.message);
            return res.code(200).send({ message: "Acknowledged." });
        })
    );

    const coolthingSchema = z.object({
        user: z.string().optional(),
        code: z.string().optional(),
    });

    server.post(
        "/coolthing",
        useSchema(coolthingSchema, async (req, res) => {
            await client.channels
                .fetch("1198755163612119163")
                .then((channel) => {
                    channel.send(
                        `${req.body.user ?? "SOMEONE"} ${
                            req.body.code ?? ""
                        }FOUND THE COOL THING!`
                    );
                });
            return res.code(200).send({ message: "Cool thing acknowledged." });
        })
    );

    const loginSchema = z.object({
        key: z.string(),
    });

    server.post(
        "/login",
        useSchema(loginSchema, async (req, res) => {
            res.header("Content-Type", "text/html; charset=utf-8");
            if (req.body.key !== process.env.MESSAGE_KEY) {
                res.code(401).send(
                    <div class="flex text-red-700 justify-center">
                        Invalid Key
                    </div>
                );
                return;
            }
            res.send(
                <form
                    hx-post="/message"
                    hx-ext="json-enc, response-targets"
                    class="flex-col justify-center"
                    hx-swap="outerHTML"
                    hx-target="#message-area"
                    hx-target-400="#message-error"
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
                    <div id="embed"></div>
                </form>
            );
        })
    );

    const guildSchema = z.object({
        guild: z.string(),
    });

    server.post(
        "/guild",
        useSchema(guildSchema, async (req, res) => {
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
                                <option value={channel.id}>
                                    {channel.name}
                                </option>
                            ))}
                    </select>
                </div>
            );
        })
    );

    server.post("/channel", async (req, res) => {
        res.header("Content-Type", "text/html; charset=utf-8");
        res.send(
            <div id="message" class="flex flex-wrap justify-center items-end">
                <div
                    id="message-input"
                    class="flex flex-wrap justify-center items-end"
                >
                    <div id="message-area">
                        <div id="message-error"></div>
                        <textarea
                            name="message"
                            class="resize max-h-48 max-w-lg min-w-48 min-h-16 rounded mt-1 mr-1 bg-slate-950 p-1"
                        />
                    </div>

                    <button
                        type="submit"
                        class="bg-sky-500 hover:bg-sky-700 rounded p-1 max-h-10 min-w-20"
                    >
                        Send
                    </button>
                    <div id="break" class="flex h-0 w-full" />
                    <label>Embed: </label>
                    <input
                        type="checkbox"
                        name="embed"
                        hx-target="#embed"
                        hx-post="/embed"
                    />
                </div>
            </div>
        );
    });

    const messageSchema = z.object({
        key: z.string(),
        channel: z.string(),
        message: z.string().optional(),
        embed: z.string().optional(),
        title: z.string().optional(),
        color: z.string().optional(),
        thumbnail: z.string().optional(),
        authorName: z.string().optional(),
        authorIcon: z.string().optional(),
        authorURL: z.string().optional(),
        footerText: z.string().optional(),
        footerIcon: z.string().optional(),
        timestamp: z.string().optional(),
        description: z.string().optional(),
        image: z.string().optional(),
    });

    server.post(
        "/message",
        useSchema(messageSchema, async (req, res) => {
            const {
                key,
                message,
                channel,
                embed,
                title,
                color,
                thumbnail,
                authorName,
                authorIcon,
                authorURL,
                footerText,
                footerIcon,
                timestamp,
                description,
                image,
            } = req.body;

            if (key !== process.env.MESSAGE_KEY) {
                throw new VisibleError("Unauthorized", 401);
            }

            const channelobj = await client.channels.fetch(channel);

            if (embed) {
                if (!description)
                    return res.code(400).send(
                        <div
                            id="message-error"
                            class="flex text-red-700 justify-center"
                        >
                            Cannot send an embed with an empty description.
                        </div>
                    );
                const messageEmbed = new EmbedBuilder().setDescription(
                    description
                );
                try {
                    if (title) messageEmbed.setTitle(title);
                    if (thumbnail) messageEmbed.setThumbnail(thumbnail);
                    //@ts-ignore
                    if (color) messageEmbed.setColor(color);
                    if (authorName || authorIcon || authorURL)
                        messageEmbed.setAuthor({
                            //@ts-ignore
                            name: authorName || null,
                            //@ts-ignore
                            iconURL: authorIcon || null,
                            //@ts-ignore
                            url: authorURL || null,
                        });
                    if (footerText || footerIcon)
                        messageEmbed.setFooter({
                            //@ts-ignore
                            text: footerText || null,
                            //@ts-ignore
                            iconURL: footerIcon || null,
                        });
                    if (timestamp)
                        messageEmbed.setTimestamp(parseDate(timestamp));
                    if (image) messageEmbed.setImage(image);
                } catch (err) {
                    return res.code(400).send(
                        <div
                            id="message-error"
                            class="flex text-red-700 justify-center"
                        >
                            Error parsing embed.
                        </div>
                    );
                }

                await channelobj.send({
                    content: message,
                    embeds: [messageEmbed],
                });
            } else if (message) await channelobj.send(message);
            else {
                return res.code(400).send(
                    <div
                        id="message-error"
                        class="flex text-red-700 justify-center"
                    >
                        Cannot send an empty message.
                    </div>
                );
            }

            return res.send(
                <div id="message-area">
                    <div id="message-error"></div>
                    <textarea
                        name="message"
                        class="resize max-h-48 max-w-lg min-w-48 min-h-16 rounded mt-1 mr-1 bg-slate-950 p-1"
                    />
                </div>
            );
        })
    );

    const embedSchema = z.object({ embed: z.string().optional() });

    server.post(
        "/embed",
        useSchema(embedSchema, async (req, res) => {
            res.header("Content-Type", "text/html; charset=utf-8");
            if (!req.body.embed) {
                res.send(<div id="embed" />);
            } else {
                res.send(
                    <div id="embed" class="flex flex-col justify-center">
                        <label>Title: </label>
                        <input
                            type="text"
                            name="title"
                            class="rounded bg-slate-950 p-1"
                        />
                        <label>Description: </label>
                        <input
                            type="text"
                            name="description"
                            class="rounded bg-slate-950 p-1"
                        />
                        <label>Color: </label>
                        <input
                            type="color"
                            name="color"
                            class="rounded bg-slate-950 p-1"
                        />
                        <label>Thumbnail: </label>
                        <input
                            type="text"
                            name="thumbnail"
                            class="rounded bg-slate-950 p-1"
                        />
                        <label>Image: </label>
                        <input
                            type="text"
                            name="image"
                            class="rounded bg-slate-950 p-1"
                        />
                        <div id="author" class="flex flex-col">
                            <label>Author: </label>
                            <div id="Author-text" class="flex flex-row m-1">
                                <label class="ml-4">Name: </label>
                                <input
                                    type="text"
                                    name="authorName"
                                    class="rounded bg-slate-950 p-1 m-1"
                                />
                            </div>
                            <div id="author-icon" class="flex flex-row m-1">
                                <label class="ml-4">Image: </label>
                                <input
                                    type="text"
                                    name="authorIcon"
                                    class="rounded bg-slate-950 p-1 m-1"
                                />
                            </div>
                            <div id="author-url" class="flex flex-row m-1">
                                <label class="ml-4">URL: </label>
                                <input
                                    type="text"
                                    name="authorURL"
                                    class="rounded bg-slate-950 p-1 m-1"
                                />
                            </div>
                        </div>
                        <div id="footer">
                            <label>Footer: </label>
                            <div id="footer-text" class="flex flex-row m-1">
                                <label class="ml-4">Text: </label>
                                <input
                                    type="text"
                                    name="footerText"
                                    class="rounded bg-slate-950 p-1 m-1"
                                />
                            </div>
                            <div id="footer-icon" class="flex flex-row m-1">
                                <label class="ml-4">Image: </label>
                                <input
                                    type="text"
                                    name="footerIcon"
                                    class="rounded bg-slate-950 p-1 m-1"
                                />
                            </div>
                        </div>
                        <label>Timestamp: </label>
                        <input
                            type="datetime-local"
                            name="timestamp"
                            class="rounded bg-slate-950 p-1"
                        />
                    </div>
                );
            }
        })
    );

    server.delete("/feedback-remove/:id", async (req, res) => {
        const feedbackRemoveParams = z.object({
            id: z.string(),
        });
        const result = feedbackRemoveParams.safeParse(req.params);
        if (result.error) {
            throw new VisibleError(result.error.toString(), 400);
        }
        const id = result.data.id;
        await prisma.feedback.delete({
            where: { id },
        });
        res.code(200);
    });

    //* running the server
    try {
        server.listen({ host: "0.0.0.0", port: parseInt(process.env.PORT!) });
        console.log("Listening on: " + process.env.PORT);
    } catch (err) {
        sentry.captureException(err);
        server.log.error(err);
        process.exit(1);
    }
};

export { start };
