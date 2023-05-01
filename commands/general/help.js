const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Displays help information.")
        .setDMPermission(false)
        .setNSFW(false),
    async execute(interaction) {
        const helpMenu = new EmbedBuilder()
            .setColor(0x00ffff)
            .setDescription("Commands:")
            .setThumbnail("https://i.imgur.com/bVm6Cue.png")
            .addFields(
                { name: "General", value: "\thelp: Displays this menu." },
                { name: "Utility", value: "\tid: Tells you your user ID." },
                { name: "Fun", value: "\twaifu: Shows you a waifu." }
            );
        await interaction.reply({ embeds: [helpMenu] });
    },
};
