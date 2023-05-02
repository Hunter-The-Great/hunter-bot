const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("waifu")
        .setDescription("Shows you a waifu.")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("NSFW/SFW")
                .addChoices(
                    { name: "SFW", value: "false" },
                    { name: "NSFW", value: "true" }
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("tag")
                .setDescription("The tag to search for")
                .addChoices(
                    { name: "waifu", value: "waifu" },
                    { name: "maid", value: "maid" },
                    { name: "Marin Kitagawa", value: "marin-kitagawa" },
                    { name: "Mori Calliope", value: "mori-calliope" },
                    { name: "Raiden Shogun", value: "raiden-shogun" },
                    { name: "oppai", value: "oppai" },
                    { name: "selfies", value: "selfies" },
                    { name: "uniform", value: "uniform" },
                    { name: "ass(NSFW)", value: "ass" },
                    { name: "hentai(NSFW)", value: "hentai" },
                    { name: "milf(NSFW)", value: "milf" },
                    { name: "oral(NSFW)", value: "oral" },
                    { name: "paizuri(NSFW)", value: "paizuri" },
                    { name: "ecchi(NSFW)", value: "ecch" },
                    { name: "ero(NSFW)", value: "ero" }
                )
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("second-tag")
                .setDescription("The tag to search for")
                .addChoices(
                    { name: "waifu", value: "waifu" },
                    { name: "maid", value: "maid" },
                    { name: "Marin Kitagawa", value: "marin-kitagawa" },
                    { name: "Mori Calliope", value: "mori-calliope" },
                    { name: "Raiden Shogun", value: "raiden-shogun" },
                    { name: "oppai", value: "oppai" },
                    { name: "selfies", value: "selfies" },
                    { name: "uniform", value: "uniform" },
                    { name: "ass(NSFW)", value: "ass" },
                    { name: "hentai(NSFW)", value: "hentai" },
                    { name: "milf(NSFW)", value: "milf" },
                    { name: "oral(NSFW)", value: "oral" },
                    { name: "paizuri(NSFW)", value: "paizuri" },
                    { name: "ecchi(NSFW)", value: "ecch" },
                    { name: "ero(NSFW)", value: "ero" }
                )
                .setRequired(false)
        )
        .setDMPermission(false)
        .setNSFW(true),
    async execute(interaction) {
        try {
            await interaction.deferReply();
        } catch (err) {
            console.log("An error has occured (waifu.js : 67)");
        }
        const flags = [
            "ass",
            "hentai",
            "milf",
            "oral",
            "paizuri",
            "ecchi",
            "ero",
        ];
        if (interaction.options.getString("type") == "false") {
            for (const flag of flags) {
                if (
                    interaction.options.getString("tag") == flag ||
                    interaction.options.getString("second-tag") == flag
                ) {
                    await interaction.editReply(
                        "No image found, try changing your tags."
                    );
                    return;
                }
            }
        }
        let url = `https://api.waifu.im/search/?&included_tags=${interaction.options.getString(
            "tag"
        )}&is_nsfw=${interaction.options.getString("type")}`;

        if (interaction.options.getString("second-tag")) {
            url =
                url +
                `&included_tags=${interaction.options.getString("second-tag")}`;
        }

        // user debug information
        //console.log("User " + interaction.user.tag + " called: " + url);
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
