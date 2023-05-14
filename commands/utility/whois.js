const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Tells you the information on a given user ID.")
    .setDMPermission(true)
    .setNSFW(false)
    .addUserOption((option) =>
        option
            .setName("target")
            .setDescription("The user to search for.")
            .setRequired(false)
    );

const execute = async (interaction) => {
    const target = interaction.options.getUser("target")
        ? interaction.options.getUser("target")
        : interaction.user;
    const date = new Date(target.createdAt);

    const info = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(target.tag)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
            {
                name: "__**ID**__",
                value: target.id,
                inline: true,
            },

            {
                name: "__**Account Created**__",
                value: date.toUTCString(),
                inline: true,
            },
            {
                name: "__**Avatar**__",
                value: hyperlink("Link", target.displayAvatarURL()),
                inline: true,
            },
            {
                name: "__**Bot?**__",
                value: target.bot ? "Yes" : "No",
                inline: true,
            }
        );

    await interaction.reply({ embeds: [info], ephemeral: true });
};

module.exports = {
    data,
    category: "utility",
    execute,
};
