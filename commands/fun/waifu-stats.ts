import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import { prisma } from "../../utilities/db.js";

const data = new SlashCommandBuilder()
    .setName("waifu-stats")
    .setDescription("Displays a user's waifu stats.")
    .setNSFW(false)
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])

    .addUserOption((option) =>
        option
            .setName("target")
            .setDescription("The user to display stats for.")
            .setRequired(false)
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const target = interaction.options.getUser("target") || interaction.user;
    if (!target) throw new Error("Is this even possible?");

    const user = await prisma.user.findUnique({ where: { id: target.id } });

    const info = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(target.username)
        .setDescription(
            `has run the /waifu command ${user?.waifuCount || 0} times (${
                user?.nsfwCount || 0
            } of which ${user?.nsfwCount === 1 ? "was" : "were"}  NSFW). ${
                target.id === "386758028533170177"
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

const category = "fun";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
