const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");

const name = Events.MessageUpdate;

const execute = async (message) => {
    try {
        await prisma.message.update({
            where: { id: message.id },
            data: { content: message.content },
        });
    } catch (err) {
        console.error(
            `Failed to update message:
            ID: ${message.id}
            Author: ${message.author.username} | ${message.author.id}
            Guild: ${message.guild.name} | ${message.guild.id}
            Channel: ${message.channel.name} | ${message.channel.id}
            Link: https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}
            Content: ${message.content}\n-------------------------------\n`,
            err
        );
    }
};

module.exports = {
    name,
    execute,
};
