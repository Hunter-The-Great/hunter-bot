const { SlashCommandBuilder } = require("discord.js");
const { redis } = require("../../utilities/db.js");
require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("gif")
    .setDescription("Loads a GIF.")
    .setDMPermission(false)
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
            )
            .addStringOption((option) =>
                option
                    .setName("alias")
                    .setDescription("The alias of the GIF to be saved.")
                    .setRequired(true)
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
            )
    );

const execute = async (interaction) => {
    const link = interaction.options.getString("link");
    const alias = interaction.options.getString("alias");
    const id = interaction.user.id;

    await interaction.deferReply({
        ephemeral: !(interaction.options.getSubcommand() === "load"),
    });

    if (interaction.options.getSubcommand() === "save") {
        if (!(await redis.hsetnx(id, alias, link))) {
            await interaction.editReply(
                "Error: alias ' " +
                    alias +
                    " already in use, please select another alias or delete the currently saved GIF."
            );
            return;
        }

        await interaction.editReply("GIF saved.");
    } else if (interaction.options.getSubcommand() === "load") {
        const data = await redis.hget(id, alias);
        await interaction.editReply(data);
    } else if (interaction.options.getSubcommand() === "list") {
        const data = await redis.hkeys(id);
        if (data.length === 0) {
            await interaction.editReply(
                "No aliases in use by " + interaction.user.tag + "."
            );
            return;
        }
        await interaction.editReply(
            "Aliases in use for " +
                interaction.user.tag +
                ": \n" +
                data.join(", ")
        );
    } else if (interaction.options.getSubcommand() === "delete") {
        if (await redis.hdel(id, alias)) {
            await interaction.editReply("GIF deleted");
        } else {
            await interaction.editReply("No GIF by that alias found.");
        }
    } else {
        interaction.editReply(
            "Something has gone wrong, please try again later."
        );
    }
};

module.exports = {
    data,
    execute,
};
