import { Events, Message } from "discord.js";
import { prisma } from "../utilities/db";
import { sentry } from "../utilities/sentry";

const name = Events.MessageDelete;

const execute = async (message: Message) => {
    if (!message.guild || message.channel.isDMBased()) return;

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
        if (!guild || !guild.logging) return;

        await prisma.message.delete({ where: { id: message.id } });
    } catch (err) {
        sentry.captureException(err);
        console.error(
            `Failed to delete message:
            ID: ${message.id}
            Author: ${message.author.username} | ${message.author.id}
            Guild: ${message.guild.name} | ${message.guild.id}
            Channel: ${message.channel.name} | ${message.channel.id}
            Link: ${message.url}
            Content: ${message.content}\n-------------------------------\n`,
            err
        );
    }
};

export { name, execute };
