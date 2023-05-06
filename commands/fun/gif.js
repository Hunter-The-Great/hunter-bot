const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
} = require("discord.js");
const { redis } = require("../../utilities/db.js");
require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("gif")
    .setDescription("GIF saver.")
    .setDMPermission(true)
    .setNSFW(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("save")
            .setDescription("Saves a GIF.")
            .addStringOption((option) =>
                option
                    .setName("link")
                    .setDescription("The link to the GIF to be saved")
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
                    .setDescription("The alias of the GIF to be Loaded")
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
                    .setDescription("The alias of the GIF to be deleted")
                    .setRequired(true)
                    .setMaxLength(100)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("clear")
            .setDescription("Clears all your saved GIFs.")
    );

const execute = async (interaction) => {
    const link = interaction.options.getString("link");
    const alias = interaction.options.getString("alias");
    const hash = "GIF:" + interaction.user.id;

    await interaction.deferReply({
        ephemeral: !(interaction.options.getSubcommand() === "load"),
    });

    if (interaction.options.getSubcommand() === "save") {
        try {
            new URL(link);
        } catch (err) {
            await interaction.editReply(
                "Error: invalid input, please provide a link to a GIF/image"
            );
            return;
        }
        if (
            link.endsWith(".com") ||
            link.endsWith(".org") ||
            link.endsWith(".edu") ||
            link.endsWith(".net") ||
            link.includes(" ") ||
            link.includes("http", 7)
        ) {
            await interaction.editReply(
                "Error: invalid input, please provide a link to a GIF/image"
            );
            return;
        }
        const regex = /^[A-Za-z0-9\s]+$/;
        if (!alias.match(regex) || alias.toLowerCase() === "null") {
            await interaction.editReply(
                "Error: invalid input, please provide an alias with only alphanumeric characters and whitespace."
            );
            return;
        }

        if (!(await redis.hsetnx(hash, alias, link))) {
            await interaction.editReply(
                "Error: alias " +
                    alias +
                    " already in use, please select another alias or delete the currently saved GIF."
            );
            return;
        }

        await interaction.editReply("GIF saved.");
    } else if (interaction.options.getSubcommand() === "load") {
        const regex = /^[A-Za-z0-9\s]+$/;
        if (!alias.match(regex) || alias.toLowerCase() === "null") {
            await interaction.editReply(
                "Error: invalid input, please provide an alias with only alphanumeric characters and whitespace."
            );
            return;
        }
        const data = await redis.hget(hash, alias);
        if (!data) {
            await interaction.editReply("No GIF by that alias found.");
            return;
        }
        await interaction.editReply(data);
    } else if (interaction.options.getSubcommand() === "list") {
        const data = await redis.hkeys(hash);
        let listEmbed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setAuthor({
                name: interaction.user.tag,
                iconURL: interaction.user.displayAvatarURL(),
            });

        if (data.length === 0) {
            listEmbed.setTitle(
                "No aliases in use by " + interaction.user.username + "."
            );
            await interaction.editReply({ embeds: [listEmbed] });
            return;
        }

        data.sort();
        listEmbed
            .setTitle("Aliases in use by " + interaction.user.username + ": ")
            .setDescription(data.join(", "));

        await interaction.editReply({ embeds: [listEmbed] });
    } else if (interaction.options.getSubcommand() === "delete") {
        if (await redis.hdel(hash, alias)) {
            await interaction.editReply("GIF deleted");
        } else {
            await interaction.editReply("No GIF by that alias found.");
        }
    } else if (interaction.options.getSubcommand() === "clear") {
        const confirm = new ButtonBuilder()
            .setCustomId("confirm")
            .setLabel("Confirm clear")
            .setStyle(ButtonStyle.Danger);

        const cancel = new ButtonBuilder()
            .setCustomId("cancel")
            .setLabel("Cancel")
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(cancel, confirm);
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

            if (confirmation.customId === "confirm") {
                const list = await redis.hkeys(hash);
                for (const item of list) {
                    await redis.hdel(hash, item);
                }
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
            await interaction.editReply({
                content: "Something went wrong, cancelling.",
                components: [],
            });
            console.error("An error has occurred: \n", err);
        }
    } else {
        interaction.editReply(
            "Something has gone wrong, please try again later."
        );
        console.log("An invalid command was given");
    }
};

module.exports = {
    data,
    category: "fun",
    execute,
};
