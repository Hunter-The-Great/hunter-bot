const { SlashCommandBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
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
            .setName("tag-2")
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
    .setNSFW(true);

const execute = async (interaction) => {
    if (interaction.user.id === process.env.HID) {
        await interaction.reply("*Down __**ATROCIOUS**__*.");
    } else {
        await interaction.reply("*Down bad*.");
    }
    const flags = ["ass", "hentai", "milf", "oral", "paizuri", "ecchi", "ero"];
    if (interaction.options.getString("type") === "false") {
        for (const flag of flags) {
            if (
                interaction.options.getString("tag") === flag ||
                interaction.options.getString("second-tag") === flag
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

    if (interaction.options.getString("tag-2")) {
        url = url + `&included_tags=${interaction.options.getString("tag-2")}`;
    }
    let response;
    try {
        response = await fetch(url);
    } catch (err) {
        await interaction.editReply(
            "Waifu.IM API failed to respond, please try again later."
        );
        return;
    }
    const data = await response.json();
    if (!data.images) {
        await interaction.editReply("No image found, try changing your tags.");
    } else {
        await interaction.editReply(data.images[0].url);
    }
};

module.exports = {
    data,
    execute,
};
