import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Displays help information.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction: ChatInputCommandInteraction) => {
    const helpMenu = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle("**Commands**:")
        .setThumbnail(process.env.AVATAR || null)
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL(),
        })
        .addFields(
            {
                name: "__**General**__",
                value: "**help**: Displays this menu.",
                inline: true,
            },
            {
                name: "__**Utility**__",
                value: `**id**: Tells you your user ID.\n\n
                        **whois**: Displays information about a given user.\n\n
                        **remind**: Sets a reminder for a given time.`,
                inline: true,
            },
            {
                name: "__**Fun**__",
                value: `**waifu**: (NSFW) Shows you a waifu.\n\n
                        **gif**: Saves and loads GIFs from the bot's database.\n\n
                        **bored**: Gives you an idea for something to do.\n\n
                        **xkcd**: Shows you an XKCD comic.`,
                inline: true,
            }
        )
        .setFooter({
            text: "I am cowboy duck, and I approve of this message.",
            iconURL: process.env.AVATAR,
        });

    await interaction.reply({ embeds: [helpMenu] });
};

const category = "general";

export { data, category, execute };
