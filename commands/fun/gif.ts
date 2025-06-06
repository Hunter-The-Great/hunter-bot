import {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import { prisma } from "../../utilities/db.js";
import { sentry } from "../../utilities/sentry.js";

const data = new SlashCommandBuilder()
    .setName("gif")
    .setDescription("GIF saver.")
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
    .setNSFW(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("save")
            .setDescription("Saves a GIF.")
            .addStringOption((option) =>
                option
                    .setName("link")
                    .setDescription("The link to the GIF to be saved.")
                    .setRequired(true)
                    .setMaxLength(500)
            )
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to be saved.")
                    .setRequired(true)
                    .setMaxLength(100)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("load")
            .setDescription("Loads a GIF.")
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to be Loaded.")
                    .setRequired(true)
                    .setMaxLength(100)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("list").setDescription("Lists all your saved GIFs.")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription("Deletes a saved GIF.")
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to be deleted.")
                    .setRequired(true)
                    .setMaxLength(100)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("clear")
            .setDescription("Clears all your saved GIFs.")
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const id = interaction.user.id;

    await interaction.deferReply({
        ephemeral: !(interaction.options.getSubcommand() === "load"),
    });

    if (interaction.options.getSubcommand() === "save") {
        const link = interaction.options.getString("link");
        const alias = interaction.options.getString("alias");
        if (!link || !alias) throw new Error("Is this even possible?");

        if (await prisma.gif.findFirst({ where: { uid: id, alias } })) {
            interaction.editReply("Alias already in use.");
            return;
        }
        const data = await prisma.gif.count({ where: { uid: id } });
        if (data >= 20) {
            interaction.editReply(
                "Too many GIFs saved, please delete a GIF before saving another."
            );
            return;
        }
        try {
            new URL(link);
        } catch (err) {
            sentry.captureException(err);
            await interaction.editReply(
                "Error: invalid input, please provide a link to a GIF/image"
            );
            return;
        }

        if (
            link.includes(" ") ||
            link.includes("http", 7) ||
            !link.startsWith("http")
        ) {
            await interaction.editReply("Error: invalid link.");
            return;
        }
        const regex = /^[A-Za-z0-9\s-_,.]+$/;
        if (!alias.match(regex) || alias.toLowerCase() === "null") {
            await interaction.editReply(
                'Error: invalid input, please provide an alias with only alphanumeric characters, whitespace, and the characters " , . - _ ".'
            );
            return;
        }

        const scrapeMeta = await fetch(
            `https://jsonlink.io/api/extract?api_key=${process.env.SCRAPER_KEY}&url=${link}`
        );
        const meta = await scrapeMeta.json();
        const response = await fetch(link);
        const type = response.headers.get("content-type");
        if (
            type &&
            (type.includes("gif") ||
                type.includes("image") ||
                type.includes("video"))
        ) {
            await prisma.gif.create({
                data: {
                    alias,
                    link,
                    user: {
                        connectOrCreate: {
                            where: { id: interaction.user.id },
                            create: {
                                id: interaction.user.id,
                                username: interaction.user.username,
                            },
                        },
                    },
                },
            });
            await interaction.editReply(`${data + 1}/20 GIFs saved.`);
            return;
        } else if (meta.images.length > 0) {
            await prisma.gif.create({
                data: {
                    alias,
                    link: meta.images[0],
                    uid: id,
                },
            });
            await interaction.editReply(`${data + 1}/20 GIFs saved.`);
            return;
        }

        await interaction.editReply("Error: invalid link.");
    } else if (interaction.options.getSubcommand() === "load") {
        const alias = interaction.options.getString("alias");
        if (!alias) throw new Error("Is this even possible?");

        const regex = /^[A-Za-z0-9\s-_,.]+$/;
        if (!alias.match(regex) || alias.toLowerCase() === "null") {
            await interaction.editReply(
                "Error: invalid input, please provide an alias with only alphanumeric characters."
            );
            return;
        }
        const data = await prisma.gif.findFirst({ where: { uid: id, alias } });
        if (!data) {
            await interaction.editReply("No GIF by that alias found.");
            return;
        }
        await interaction.editReply(data.link);
    } else if (interaction.options.getSubcommand() === "list") {
        const data = await prisma.gif.findMany({
            where: { uid: id },
            orderBy: { savedAt: "asc" },
        });
        let listEmbed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setFooter({ text: `${data.length}/20` });

        if (data.length === 0) {
            listEmbed.setTitle(
                "No aliases in use by " + interaction.user.username + "."
            );
            await interaction.editReply({ embeds: [listEmbed] });
            return;
        }

        listEmbed
            .setTitle("Aliases in use by " + interaction.user.username + ": ")
            .setDescription(data.map((gif) => gif.alias).join("\n"));

        await interaction.editReply({ embeds: [listEmbed] });
    } else if (interaction.options.getSubcommand() === "delete") {
        const alias = interaction.options.getString("alias");
        if (!alias) throw new Error("Is this even possible?");

        if (await prisma.gif.deleteMany({ where: { uid: id, alias } })) {
            await interaction.editReply("GIF deleted");
        } else {
            await interaction.editReply("No GIF by that alias found.");
        }
    } else if (interaction.options.getSubcommand() === "clear") {
        const confirm = new ButtonBuilder()
            .setCustomId(`confirm:${interaction.user.id}`)
            .setLabel("Confirm clear")
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId(`cancel:${interaction.user.id}`)
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            cancel,
            confirm
        );
        const response = await interaction.editReply({
            content: "Are you sure you want to clear all saved GIFs?",
            components: [row],
        });

        const collectorFilter = (i) => i.user.id === interaction.user.id;

        try {
            const confirmation = await response.awaitMessageComponent({
                filter: collectorFilter,
                time: 60_000,
            });

            if (confirmation.customId.includes("confirm")) {
                await prisma.gif.deleteMany({ where: { uid: id } });
                await confirmation.update({
                    content: "GIFs deleted.",
                    components: [],
                });
            } else if (confirmation.customId.includes("cancel")) {
                await confirmation.update({
                    content: "Action cancelled.",
                    components: [],
                });
            }
        } catch (err) {
            sentry.captureException(err);
            await interaction.editReply({
                content: "Something went wrong, cancelling.",
                components: [],
            });
            console.error("An error has occurred: \n", err);
        }
    } else {
        console.log(
            `ERROR: subcommand not found for /guessing: ${interaction.options.getSubcommand()}`
        );
        await interaction.editReply(
            "An error occured, please try again later."
        );
    }
};

const category = "fun";

export { data, category, execute };
