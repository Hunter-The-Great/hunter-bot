const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");

const name = Events.MessageDelete;

const execute = async (message) => {
    try {
        await prisma.message.delete({ where: { id: message.id } });
    } catch (err) {
        console.error(
            `Failed to delete message:
            ID: ${message.id}
            Author: ${message.author.username} | ${message.author.id}
            Guild: ${message.guild.name} | ${message.guild.id}
            Channel: ${message.channel.name} | ${message.channel.id}
            Content: ${message.content}\n-------------------------------\n`,
            err
        );
    }
};

module.exports = {
    name,
    execute,
};
