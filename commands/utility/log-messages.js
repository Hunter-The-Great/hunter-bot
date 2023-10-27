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

    await interaction.reply({
        content: "Please wait, this may take a long time.",
        ephemeral: false,
    });
    const channels = (await interaction.guild.channels.fetch()).values();
    let messages = [];
    messages.push(
        ...(await interaction.channel.messages.fetch({ limit: 1 })).values()
    );
    try {
        for (const channel of channels) {
            if (!(channel instanceof TextChannel)) continue;

            if (!messages[0])
                messages.push(
                    ...(await channel.messages.fetch({ limit: 1 })).values()
                );
            if (!messages[0]) continue;

            let lastMessage;
            console.log(channel.name);
            do {
                lastMessage = messages[messages.length - 1];
                const fetchedMessages = await channel.messages.fetch({
                    limit: 100,
                    before: messages[messages.length - 1].id
                        ? messages[messages.length - 1].id
                        : undefined,
                });
                messages.push(...fetchedMessages.values());
                console.log(
                    lastMessage.id + " " + messages[messages.length - 1].id
                );
            } while (lastMessage.id !== messages[messages.length - 1].id);
        }
    } catch (err) {
        console.error(err);
    }
    await interaction.channel.send("Uploading messages to database.");
    for (const message of messages) {
        await prisma.message.upsert({
            where: { id: message.id },
            update: {
                content: message.content,
            },
            create: {
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
            },
        });
    }
    await interaction.channel.send({
        content: `Logged ${messages.length} messages.`,
    });
};

module.exports = {
    data,
    category: "utility",
    execute,
};
