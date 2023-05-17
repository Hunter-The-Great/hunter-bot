const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const fetch = require("isomorphic-fetch");
const { prisma } = require("../../utilities/db.js");

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
    /*
    if (interaction.user.id === process.env.HID) {
        await interaction.reply("*Down __**ATROCIOUS**__*.");
    } else {
        await interaction.reply("*Down bad*.");
    }
    */
    await interaction.deferReply();
    const flags = ["ass", "hentai", "milf", "oral", "paizuri", "ecchi", "ero"];
    if (interaction.options.getString("type") === "false") {
        for (const flag of flags) {
            if (
                interaction.options.getString("tag") === flag ||
                interaction.options.getString("tag-2") === flag
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

    const response = await fetch(url);

    if (!response.ok) {
        await interaction.editReply(
            "Waifu.im API failed to respond, please try again later."
        );
        console.log(
            "Waifu.im communication failure, code: " +
                response.status +
                "\n\n" +
                response.statusText
        );
        return;
    }

    const data = await response.json();
    if (!data.images) {
        await interaction.editReply("No image found, try changing your tags.");
    } else {
        const image = data.images[0].url;
        const rarityCheck = image.substring(image.length - 6, image.length - 4);
        const rarityNum = parseInt(rarityCheck);
        let rarity;
        if (rarityNum < 35) {
            rarity = 1;
        } else if (rarityNum < 70) {
            rarity = 2;
        } else if (rarityNum < 87) {
            rarity = 3;
        } else if (rarityNum < 96) {
            rarity = 4;
        } else {
            rarity = 5;
        }
        let starList = ":star:";
        for (let i = 1; i < rarity; ++i) {
            starList += ":star:";
        }

        let color;
        if (rarity === 1) {
            color = 0xffffff;
        } else if (rarity === 2) {
            color = 0x20f123;
        } else if (rarity === 3) {
            color = 0x1c55ec;
        } else if (rarity === 4) {
            color = 0x811bee;
        } else if (rarity === 5) {
            color = 0xece91c;
        } else {
            color = 0x000000;
        }
        const embed = new EmbedBuilder()
            .setColor(color)
            .setImage(image)
            .setDescription(`Rarity: ${starList}`);

        const save = new ButtonBuilder()
            .setCustomId(`waifu-save:${interaction.user.id}`)
            .setLabel("Save")
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(save);

        const rsp = await interaction.editReply({
            embeds: [embed],
            components: [row],
        });

        const filter = (i) =>
            i.customId.startsWith("waifu-save") &&
            i.user.id === interaction.user.id;
        const collector = rsp.createMessageComponentCollector({
            filter,
            time: 120_000,
        });
        collector.on("collect", async (i) => {
            //* ------------------------------------------------------------------------------ console.on("collect")
            const data = await prisma.waifu.count({
                where: { uid: interaction.user.id },
            });
            if (data >= 20) {
                rsp.reply({
                    content:
                        "Too many waifus saved, please delete one before saving another.",
                    ephemeral: true,
                });
                return;
            }
            if (
                await prisma.waifu.findFirst({
                    where: { uid: interaction.user.id, image },
                })
            ) {
                i.reply({
                    content: "Image already in Compendium.",
                    ephemeral: true,
                });
                return;
            }

            await prisma.waifu.create({
                data: {
                    uid: interaction.user.id,
                    image,
                    rarity,
                },
            });

            const saved = new ButtonBuilder()
                .setCustomId("saved")
                .setLabel("Saved")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);
            row.setComponents(saved);
            i.update({ components: [row] });
        });
        collector.on("end", async () => {
            //* ------------------------------------------------------------------------------ console.on("end")
            const save = new ButtonBuilder()
                .setCustomId("save")
                .setLabel(
                    await interaction
                        .fetchReply()
                        .then((r) => r.components[0].components[0].label)
                )
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);
            row.setComponents(save);
            interaction.editReply({ components: [row] });
        });
    }
};

module.exports = {
    data,
    category: "fun",
    execute,
};
