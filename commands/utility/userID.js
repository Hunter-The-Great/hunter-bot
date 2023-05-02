const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("id")
    .setDescription("Tells you your user ID")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.reply({
        content: "Your user ID is: " + interaction.user.id,
        ephemeral: true,
    });
};

module.exports = {
    data,
    execute,
};
