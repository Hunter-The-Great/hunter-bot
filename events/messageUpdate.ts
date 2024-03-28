import { Events, Message } from "discord.js";
import { prisma } from "../utilities/db";
import { sentry } from "../utilities/sentry";

const name = Events.MessageUpdate;

const execute = async (oldMessage: Message, newMessage: Message) => {
    if (oldMessage.content === newMessage.content) return;
    if (!(oldMessage.guild && newMessage.guild)) return;
    if (oldMessage.channel.isDMBased() || newMessage.channel.isDMBased())
        return;

    if (oldMessage.content === newMessage.content) return;
    try {
        await prisma.guild.upsert({
            where: {
                id: oldMessage.guild.id,
            },
            create: {
                id: oldMessage.guild.id,
            },
            update: {},
        });
        const guild = await prisma.guild.findUnique({
            where: {
                id: oldMessage.guild.id,
            },
        });
        if (!guild || !guild.logging) return;

        await prisma.message.update({
            where: { id: oldMessage.id },
            data: { content: newMessage.content },
        });
    } catch (err) {
        sentry.captureException(err);
        console.error(
            `Failed to update message:
            ID: ${newMessage.id}
            Author: ${newMessage.author.username} | ${newMessage.author.id}
            Guild: ${newMessage.guild.name} | ${newMessage.guild.id}
            Channel: ${newMessage.channel.name} | ${newMessage.channel.id}
            Link: ${newMessage.url}
            Content: ${newMessage.content}\n-------------------------------\n`,
            err
        );
    }
};

export { name, execute };
