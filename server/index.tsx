import { prisma } from "../utilities/db";
import websocket from "@fastify/websocket";
import cors from "@fastify/cors";
import { EmbedBuilder, TextChannel } from "discord.js";
import { sentry } from "../utilities/sentry";
import { FastifyReply, FastifyRequest, fastify } from "fastify";
import { BaseHtml } from "./baseHtml";
import { FeedbackHtml } from "./feedback";
import { z, ZodError, ZodSchema } from "zod";
import { FastifyRequestType } from "fastify/types/type-provider";

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
                <div class="flex h-1/2  w-full items-center justify-center">
                    <form
                        id="login"
                        hx-post="/login"
                        hx-ext="response-targets, json-enc"
                        hx-swap="outerHTML"
                        hx-target="#login"
                        hx-target-401="#login-error"
                        class="scale-150"
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

    const messageSchema = z.object({
        key: z.string(),
        channel: z.string(),
        message: z.string(),
    });

    server.post(
        "/message",
        useSchema(messageSchema, async (req, res) => {
            const { key, message, channel } = req.body;

            if (key !== process.env.MESSAGE_KEY) {
                throw new VisibleError("Unauthorized", 401);
            }

            const channelobj = await client.channels.fetch(channel);

            await channelobj.send(message);
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
