import { SlashCommandBuilder, EmbedBuilder, hyperlink } from "discord.js";
import { prisma } from "../../utilities/db";

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
    await interaction.deferReply({ ephemeral: false });

    const user = await prisma.user.findUnique({
        where: { id: target.id },
        include: { messages: true },
    });

    const messages = user?.messages.filter(
        (message) => message.guildID === interaction.guild.id
    );

    const info = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(target.username)
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
            },
            {
                name: "__**Messages Sent**__",
                value: `${messages?.length}`,
                inline: true,
            }
        );

    await interaction.editReply({ embeds: [info], ephemeral: false });
};

const category = "utility";

export { data, category, execute };
