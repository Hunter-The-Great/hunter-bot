const { Events } = require("discord.js");
const { prisma } = require("../utilities/db");
const { executeJarvis } = require("../jarvis/jarvis.js");

const name = Events.MessageCreate;

const execute = async (message) => {
    try {
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
        if (message.author.id === process.env.CLIENT_ID || message.author.bot) {
            return;
        }
        if (message.content.toLowerCase() === "hello there") {
            try {
                await message.channel.send("General Kenobi");
            } catch (err) {
                console.error("An error has ocurred.", err);
            }
        }

        //* Text commands
        if (message.content.startsWith("~!")) {
            try {
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
    }
};

module.exports = {
    name,
    execute,
};
