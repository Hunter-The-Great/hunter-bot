const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("waifu")
        .setDescription("Shows you a waifu.")
        .addStringOption((option) =>
            option
                .setName("tag")
                .setDescription("The tag to search for")
                .addChoices(
                    { name: "maid", value: "maid" },
                    { name: "waifu", value: "waifu" },
                    { name: "Marin Kitagawa", value: "marin-kitagawa" },
                    { name: "Mori Calliope", value: "mori-calliope" },
                    { name: "Raiden Shogun", value: "raiden-shogun" },
                    { name: "oppai", value: "oppai" },
                    { name: "selfies", value: "selfies" },
                    { name: "uniform", value: "uniform" }
                )
                .setRequired(true)
        )
        .addBooleanOption((option) =>
            option
                .setName("nsfw")
                .setDescription("toggles NSFW")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("nsfw-tag")
                .setDescription("The tag to search for")
                .addChoices(
                    { name: "ass", value: "ass" },
                    { name: "hentai", value: "hentai" },
                    { name: "milf", value: "milf" },
                    { name: "oral", value: "oral" },
                    { name: "paizuri", value: "paizuri" },
                    { name: "ecchi", value: "ecch" },
                    { name: "ero", value: "ero" }
                )
                .setRequired(false)
        )
        .setDMPermission(false)
        .setNSFW(true),
    async execute(interaction) {
        await interaction.deferReply();
        url = `https://api.waifu.im/search/?&included_tags=${interaction.options.getString(
            "tag"
        )}&is_nsfw=${interaction.options.getBoolean("nsfw")}`;
        if (
            interaction.options.getBoolean("nsfw") &&
            interaction.options.getString("nsfw-tag")
        ) {
            url =
                url +
                `&included_tags=${interaction.options.getString("nsfw-tag")}`;
        }
        // user debug information
        // console.log("User " + interaction.user.tag + " called: " + url);
        const response = await fetch(url);
        const data = await response.json();
        if (!data.images) {
            await interaction.editReply(
                "No image found, try changing your tags."
            );
        } else {
            await interaction.editReply(data.images[0].url);
        }
    },
};
