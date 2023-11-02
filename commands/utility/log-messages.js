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
    let total = 0;
    try {
        if (
            !(await prisma.guild.findUnique({
                where: { id: interaction.guild.id },
            }))
        ) {
            await prisma.guild.create({
                data: {
                    id: interaction.guild.id,
                },
            });
        }

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
                        connect: {
                            id: lastMessage.guild.id,
                        },
                    },
                },
            });

            total += 1;

            let messages = [];
            let messageMap = [];
            let clearedUsers = [];
            let count = 0;
            do {
                if (count !== 0) {
                    lastMessage = messageMap[messageMap.length - 1];
                }
                count++;
                messages = await channel.messages.fetch({
                    limit: 100,
                    before: lastMessage.id,
                });

                messageMap = messages.map((message) => ({
                    id: message.id,
                    content: message.content,
                    timestamp: new Date(message.createdTimestamp),
                    author: message.author.id,
                    guildID: interaction.guild.id,
                    channel: message.channel.id,
                }));
                for (const message of messages.values()) {
                    if (clearedUsers.includes(message.author.id)) continue;
                    if (
                        await prisma.user.findUnique({
                            where: { id: message.author.id },
                        })
                    ) {
                        clearedUsers.push(message.author.id);
                        continue;
                    }
                    await prisma.user.create({
                        data: {
                            id: message.author.id,
                            username: message.author.username,
                            bot: message.author.bot,
                        },
                    });
                }
                await prisma.message.createMany({
                    data: messageMap,
                });
                total += messageMap.length;
                await interaction.editReply({
                    content: `Please wait, this may take a long time.\nLogged ${total} messages.`,
                });
            } while (messageMap.length !== 0);
        }
    } catch (err) {
        console.error(err);
        await interaction.editReply({
            content: `An error occurred while logging messages.`,
        });
    }

    await interaction.editReply({
        content: `Successfully logged ${total} messages.`,
    });
};

module.exports = {
    data,
    category: "utility",
    execute,
};
