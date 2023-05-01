const { SlashCommandBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("waifu")
        .setDescription("Shows you a waifu.")
        .addSubcommand((subcommand) =>
            subcommand
                .setName("sfw")
                .setDescription("sfw waifus")
                .addStringOption((option) =>
                    option
                        .setName("tag")
                        .setDescription("tag to search for")
                        .addChoices(
                            { name: "waifu", value: "waifu" },
                            { name: "maid", value: "maid" },
                            { name: "Marin Kitagawa", value: "marin-kitagawa" },
                            { name: "Mori Calliope", value: "mori-calliope" },
                            { name: "Raiden Shogun", value: "raiden-shogun" },
                            { name: "oppai", value: "oppai" },
                            { name: "selfies", value: "selfies" },
                            { name: "uniform", value: "uniform" }
                        )
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("nsfw")
                .setDescription("nsfw waifus")
                .addStringOption((option) =>
                    option
                        .setName("tag")
                        .setDescription("tag to search for")
                        .addChoices(
                            { name: "waifu", value: "waifu" },
                            { name: "maid", value: "maid" },
                            { name: "Marin Kitagawa", value: "marin-kitagawa" },
                            { name: "Mori Calliope", value: "mori-calliope" },
                            { name: "Raiden Shogun", value: "raiden-shogun" },
                            { name: "oppai", value: "oppai" },
                            { name: "selfies", value: "selfies" },
                            { name: "uniform", value: "uniform" },
                            { name: "ass", value: "ass" },
                            { name: "hentai", value: "hentai" },
                            { name: "milf", value: "milf" },
                            { name: "oral", value: "oral" },
                            { name: "paizuri", value: "paizuri" },
                            { name: "ecchi", value: "ecch" },
                            { name: "ero", value: "ero" }
                        )
                        .setRequired(true)
                )
        )
        .setDMPermission(false)
        .setNSFW(true),
    async execute(interaction) {
        await interaction.deferReply();
        url =
            `https://api.waifu.im/search/?&included_tags=${interaction.options.getString(
                "tag"
            )}&is_nsfw=` +
            (interaction.options._subcommand == "sfw" ? "false" : "true");

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
