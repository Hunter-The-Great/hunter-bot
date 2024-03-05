const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");

const name = Events.MessageUpdate;

const execute = async (oldMessage, newMessage) => {
    if (oldMessage.content === newMessage.content) return;
    try {
        await prisma.message.update({
            where: { id: oldMessage.id },
            data: { content: newMessage.content },
        });
    } catch (err) {
        console.error(
            `Failed to update message:
            ID: ${newMessage.id}
            Author: ${newMessage.author.username} | ${newMessage.author.id}
            Guild: ${newMessage.guild.name} | ${newMessage.guild.id}
            Channel: ${newMessage.channel.name} | ${newMessage.channel.id}
            Link: https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}
            Content: ${newMessage.content}\n-------------------------------\n`,
            err
        );
    }
};

module.exports = {
    name,
    execute,
};
