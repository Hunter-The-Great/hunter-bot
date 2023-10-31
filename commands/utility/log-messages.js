const {
    SlashCommandBuilder,
    TextChannel,
    PermissionsBitField,
} = require("discord.js");
const { prisma } = require("../../utilities/db");

const data = new SlashCommandBuilder()
    .setName("log-messages")
    .setDescription("Logs all messages in a server.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    const member = await interaction.channel.guild.members.fetch({
        force: true,
        user: interaction.user.id,
    });
    if (
        !(
            member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            interaction.user.id === interaction.channel.guild.ownerId
        )
    ) {
        await interaction.reply({
            content: "You do not have admin permissions in this server.",
            ephemeral: true,
        });
        return;
    }

    await prisma.message.deleteMany({
        where: {
            guildID: interaction.guild.id,
        },
    });

    await interaction.reply({
        content: "Please wait, this may take a long time.",
        ephemeral: false,
    });
    const channels = (await interaction.guild.channels.fetch()).values();
    try {
        for (const channel of channels) {
            if (!(channel instanceof TextChannel)) continue;

            let lastMessage = (
                await channel.messages.fetch({ limit: 1 })
            ).first();

            if (!lastMessage) continue;

            await prisma.message.create({
                data: {
                    id: lastMessage.id,
                    content: lastMessage.content,
                    timestamp: new Date(lastMessage.createdTimestamp),
                    user: {
                        connectOrCreate: {
                            where: {
                                id: lastMessage.author.id,
                            },
                            create: {
                                id: lastMessage.author.id,
                                username: lastMessage.author.username,
                                bot: lastMessage.author.bot,
                            },
                        },
                    },
                    channel: lastMessage.channel.id,
                    guild: {
                        connectOrCreate: {
                            where: {
                                id: lastMessage.guild.id,
                            },
                            create: {
                                id: lastMessage.guild.id,
                            },
                        },
                    },
                },
            });

            console.log(channel.name);
            let messages = [];
            do {
                if (messages.length > 0)
                    lastMessage = messages[messages.length - 1];
                messages = await channel.messages.fetch({
                    limit: 2,
                    before: lastMessage.id,
                });

                await prisma.message.createMany({
                    data: messages.map((message) => ({
                        id: message.id,
                        content: message.content,
                        timestamp: new Date(message.createdTimestamp),
                        user: {
                            connectOrCreate: {
                                where: {
                                    id: message.author.id,
                                },
                                create: {
                                    id: message.author.id,
                                    username: message.author.username,
                                    bot: message.author.bot,
                                },
                            },
                        },
                        channel: message.channel.id,
                        guild: {
                            connectOrCreate: {
                                where: {
                                    id: message.guild.id,
                                },
                                create: {
                                    id: message.guild.id,
                                },
                            },
                        },
                    })),
                });
                console.log(
                    lastMessage.id + " " + messages[messages.length - 1].id
                );
            } while (lastMessage.id !== messages[messages.length - 1].id);
        }
    } catch (err) {
        console.error(err);
    }

    await interaction.channel.send({
        content: `done`,
    });
};

module.exports = {
    data,
    category: "utility",
    execute,
};
