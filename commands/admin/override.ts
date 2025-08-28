import {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ChatInputCommandInteraction,
    ApplicationIntegrationType,
    InteractionContextType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import { prisma } from "../../utilities/db.js";
import { sentry } from "../../utilities/sentry.js";

const data = new SlashCommandBuilder()
    .setName("override")
    .setDescription("Overrides a command.")
    .setNSFW(false)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
    .addSubcommand((subcommand) =>
        subcommand
            .setName("gif-list")
            .setDescription("Lists all saved GIFs of a given user.")
            .addStringOption((option) =>
                option
                    .setName("uid")
                    .setDescription("The UID to override.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("gif-load")
            .setDescription("Loads a GIF.")
            .addStringOption((option) =>
                option
                    .setName("uid")
                    .setDescription("The UID to override.")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to be loaded.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("gif-delete")
            .setDescription("Deletes a GIF.")
            .addStringOption((option) =>
                option
                    .setName("uid")
                    .setDescription("The UID to override.")
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to delete.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("gif-clear")
            .setDescription("Clears all of a user's GIFs.")
            .addStringOption((option) =>
                option
                    .setName("uid")
                    .setDescription("The UID to override.")
                    .setRequired(true)
            )
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    let puppet;
    try {
        puppet = await interaction.client.users.fetch(
            interaction.options.getString("uid")!
        );
    } catch (err) {
        sentry.captureException(err); // Maybe don't log this?
        interaction.reply("User not found.");
        return;
    }
    if (interaction.options.getSubcommand().includes("gif")) {
        await interaction.deferReply();

        if (interaction.options.getSubcommand() === "gif-list") {
            const data = await prisma.gif.findMany({
                where: { uid: puppet.id },
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
                .setTitle(
                    "Aliases in use by " + interaction.user.username + ": "
                )
                .setDescription(data.map((gif) => gif.alias).join("\n"));

            await interaction.editReply({ embeds: [listEmbed] });

            return;
        } else if (interaction.options.getSubcommand() === "gif-load") {
            const alias = interaction.options.getString("alias");
            if (!alias) throw new Error("Is this even possible?");

            const data = await prisma.gif.findFirst({
                where: { uid: puppet.id, alias },
            });
            if (!data) {
                await interaction.editReply("No GIF by that alias found.");
                return;
            }
            await interaction.editReply(data.link);
        } else if (interaction.options.getSubcommand() === "gif-delete") {
            const alias = interaction.options.getString("alias");
            if (!alias) throw new Error("Is this even possible?");

            if (
                await prisma.gif.deleteMany({
                    where: { uid: puppet.id, alias },
                })
            ) {
                await interaction.editReply("GIF deleted");
            } else {
                await interaction.editReply("No GIF by that alias found.");
            }
        } else if (interaction.options.getSubcommand() === "gif-clear") {
            const confirm = new ButtonBuilder()
                .setCustomId("confirm")
                .setLabel("Confirm clear")
                .setStyle(ButtonStyle.Danger);

            const cancel = new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
                cancel,
                confirm
            );
            const response = await interaction.editReply({
                content: `Are you sure you want to clear all saved GIFs of ${puppet.tag}?`,
                components: [row],
            });

            const collectorFilter = (i) => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 60_000,
                });

                if (confirmation.customId === "confirm") {
                    await prisma.gif.deleteMany({ where: { uid: puppet.id } });
                    await confirmation.update({
                        content: "GIFs deleted.",
                        components: [],
                    });
                } else if (confirmation.customId === "cancel") {
                    await confirmation.update({
                        content: "Action cancelled",
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
                `ERROR: subcommand not found for /override gif: ${interaction.options.getSubcommand()}`
            );
            await interaction.reply(
                "An error occured, please try again later."
            );
        }
    } else {
        console.log(
            `ERROR: subcommand not found for /override: ${interaction.options.getSubcommand()}`
        );
        await interaction.reply("An error occured, please try again later.");
    }
};

const category = "admin";
const scopes = [Scopes.admin];

export { data, category, scopes, execute };
