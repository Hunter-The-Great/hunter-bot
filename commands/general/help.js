const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays help information.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    const helpMenu = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle("**Commands**:")
        .setThumbnail("https://i.imgur.com/bVm6Cue.png")
        .addFields(
            {
                name: "__**General**__",
                value: "**help**: Displays this menu.",
                inline: true,
            },
            {
                name: "__**Utility**__",
                value: "**id**: Tells you your user ID.",
                inline: true,
            },
            {
                name: "__**Fun**__",
                value: "**waifu**: (NSFW) Shows you a waifu.\n\n**gif**: Saves and loads GIFs from the bot's database.",
                inline: true,
            }
        )
        .setFooter({
            text: "I am cowboy duck, and I approve of this message.",
            iconURL: "https://i.imgur.com/bVm6Cue.png",
        });
    await interaction.reply({ embeds: [helpMenu] });
};

module.exports = {
    data,
    execute,
};
