const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays help information."),
    async execute(interaction) {
        const helpMenu = new EmbedBuilder()
            .setColor(0x00ffff)
            .setDescription("Commands:")
            .addFields(
                { name: "General", value: "    help: displays this menu" },
                { name: "Utility", value: "    id: Tells you your user ID" }
            );
        await interaction.reply({ embeds: [helpMenu] });
    },
};
