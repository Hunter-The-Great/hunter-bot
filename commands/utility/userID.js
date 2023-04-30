const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("id")
        .setDescription("Tells you your user ID")
        .setNSFW(false),
    async execute(interaction) {
        await interaction.reply({
            content: "Your user ID is: " + interaction.user.id,
            ephemeral: true,
        });
    },
};
