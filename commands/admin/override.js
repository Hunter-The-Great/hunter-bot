const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
} = require("discord.js");
const { redis } = require("../../utilities/db.js");

const data = new SlashCommandBuilder()
    .setName("override")
    .setDescription("Overrides a command.")
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
    )
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    let puppet;
    try {
        puppet = await interaction.client.users.fetch(
            interaction.options.getString("uid")
        );
    } catch (err) {
        interaction.reply("User not found.");
        return;
    }
    if (interaction.options.getSubcommand().includes("gif")) {
        await interaction.deferReply();
        const alias = interaction.options.getString("alias");
        const hash = "GIF:" + interaction.options.getString("uid");

        if (interaction.options.getSubcommand() === "gif-list") {
            const data = await redis.hkeys(hash);
            let listEmbed = new EmbedBuilder()
                .setColor(0x00ffff)
                .setThumbnail(puppet.displayAvatarURL())
                .setAuthor({
                    name: puppet.tag,
                    iconURL: puppet.displayAvatarURL(),
                })
                .setFooter({ text: `${data.length}/20` });

            if (data.length === 0) {
                listEmbed.setTitle(
                    "No aliases in use by " + puppet.username + "."
                );
                await interaction.editReply({ embeds: [listEmbed] });
                return;
            }

            data.sort();
            listEmbed
                .setTitle("Aliases in use by " + puppet.username + ": ")
                .setDescription(data.join("\n"));

            await interaction.editReply({ embeds: [listEmbed] });
            return;
        } else if (interaction.options.getSubcommand() === "gif-load") {
            const data = await redis.hget(hash, alias);
            if (!data) {
                await interaction.editReply("No GIF by that alias found.");
                return;
            }
            await interaction.editReply(data);
        } else if (interaction.options.getSubcommand() === "gif-delete") {
            if (await redis.hdel(hash, alias)) {
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

            const row = new ActionRowBuilder().addComponents(cancel, confirm);
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
    }
};

module.exports = {
    data,
    category: "admin",
    execute,
};
