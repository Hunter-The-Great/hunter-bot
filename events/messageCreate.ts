import { Events, Message } from "discord.js";
import { prisma } from "../utilities/db";
import { executeJarvis } from "../jarvis/jarvis.js";
import { sentry } from "../utilities/sentry";

const name = Events.MessageCreate;

const execute = async (message: Message) => {
    if (!message.guild) return;

    try {
        await prisma.guild.upsert({
            where: {
                id: message.guild.id,
            },
            create: {
                id: message.guild.id,
            },
            update: {},
        });
        const guild = await prisma.guild.findUnique({
            where: {
                id: message.guild.id,
            },
        });

        if (guild?.logging && message.content !== "") {
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
        }
        if (message.author.id === process.env.CLIENT_ID || message.author.bot) {
            return;
        }
        if (message.content.toLowerCase() === "hello there") {
            try {
                await message.channel.send("General Kenobi");
            } catch (err) {
                console.error("An error has ocurred.", err);
                sentry.captureException(err);
            }
        }

        //* Text commands
        if (message.content.startsWith("~!")) {
            try {
                //@ts-ignore
                const command = message.client.textCommands.get(
                    message.content.slice(2)
                );
                if (!command) {
                    throw new Error(
                        `Text command "${message.content.slice(2)}" not found`
                    );
                }
                await command.execute(message);
            } catch (err) {
                console.error("Failed to execute text command:\n", err);
                sentry.captureException(err);
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
            await prisma.guild.findFirst({
                where: { id: message.guild.id },
            })
        ) {
            executeJarvis(message);
        }
    } catch (err) {
        console.error("An error has occurred:\n", err);
        sentry.captureException(err);
    }
};

export { name, execute };
