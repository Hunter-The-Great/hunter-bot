const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { prisma } = require("../../utilities/db");

const data = new SlashCommandBuilder()
    .setName("jarvis")
    .setDescription("Toggles Jarvis mode.")
    .setDMPermission(false)
    .setNSFW(false)
    .addBooleanOption((option) =>
        option
            .setName("status")
            .setDescription("Turns Jarvis on/off")
            .setRequired(true)
    );

const execute = async (interaction) => {
    const channel = await interaction.channel;
    const member = await channel.guild.members.fetch({
        force: true,
        user: interaction.user.id,
    });
    if (
        !(
            member.permissions.has(PermissionsBitField.Flags.Administrator) ||
            interaction.user.id === channel.guild.ownerId
        )
    ) {
        await interaction.reply({
            content: "You do not have admin permissions in this server.",
            ephemeral: true,
        });
        return;
    }

    await prisma.guild.upsert({
        where: { id: interaction.guild.id },
        update: { jarvis: interaction.options.getBoolean("status") },
        create: {
            id: interaction.guild.id,
            jarvis: interaction.options.getBoolean("status"),
        },
    });

    if (interaction.options.getBoolean("status")) {
        await interaction.reply({
            content: "At your service.",
            ephemeral: false,
        });
    } else {
        await interaction.reply({
            content: "Jarvis has been disabled.",
            ephemeral: false,
        });
    }
};

module.exports = {
    data,
    category: "utility",
    execute,
};
