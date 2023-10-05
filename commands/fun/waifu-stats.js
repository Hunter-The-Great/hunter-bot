const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { prisma } = require("../../utilities/db.js");

const data = new SlashCommandBuilder()
    .setName("waifu-stats")
    .setDescription("Displays a user's waifu stats.")
    .setDMPermission(false)
    .setNSFW(false)
    .addUserOption((option) =>
        option
            .setName("target")
            .setDescription("The user to display stats for.")
            .setRequired(false)
    );

const execute = async (interaction) => {
    const target = interaction.options.getUser("target")
        ? interaction.options.getUser("target")
        : interaction.user;

    const user = await prisma.user.findUnique({ where: { uid: target.id } });

    const info = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(target.username)
        .setDescription(
            `has run the /waifu command ${user ? user.waifuCount : 0} times. ${
                target.id === process.env.MY_ID
                    ? "\n(it's for testing, ok?)"
                    : " "
            }`
        )
        .setThumbnail(target.displayAvatarURL())

        .addFields(
            {
                name: "**Size of compendium:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id },
                })}`,
                inline: true,
            },
            {
                name: "**5 stars:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id, rarity: 5 },
                })}`,
                inline: false,
            },
            {
                name: "**4 stars:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id, rarity: 4 },
                })}`,
                inline: false,
            },
            {
                name: "**3 stars:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id, rarity: 3 },
                })}`,
                inline: false,
            },
            {
                name: "**2 stars:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id, rarity: 2 },
                })}`,
                inline: false,
            },
            {
                name: "**1 stars:**",
                value: `${await prisma.waifu.count({
                    where: { uid: target.id, rarity: 1 },
                })}`,
                inline: false,
            }
        );

    await interaction.reply({
        embeds: [info],
    });
};

module.exports = {
    data,
    category: "fun",
    execute,
};
