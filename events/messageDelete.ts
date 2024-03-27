import { Events, Message } from "discord.js";
import { prisma } from "../utilities/db";

const name = Events.MessageDelete;

const execute = async (message: Message) => {
    if (!message.guild || message.channel.isDMBased()) return;
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

    try {
        await prisma.message.delete({ where: { id: message.id } });
    } catch (err) {
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
