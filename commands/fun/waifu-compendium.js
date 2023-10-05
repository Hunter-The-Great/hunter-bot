const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const { prisma } = require("../../utilities/db.js");

const data = new SlashCommandBuilder()
    .setName("waifu-compendium")
    .setDescription("shows your compendium of waifus.")
    .addUserOption((option) =>
        option
            .setName("target")
            .setDescription("The user whose compendium you want to see.")
            .setRequired(false)
    )
    .setDMPermission(false)
    .setNSFW(true);

const execute = async (interaction) => {
    await interaction.deferReply();
    const user = interaction.options.getUser("target") || interaction.user;
    const waifus = await prisma.waifu.findMany({
        where: { uid: user.id },
        orderBy: { rarity: "desc" },
    });

    if (waifus.length === 0) {
        await interaction.editReply({
            content: "No waifus found.",
            ephemeral: true,
        });
        return;
    }

    function getStars(rarity) {
        let stars = "";
        for (let i = 0; i < rarity; i++) {
            stars += ":star:";
        }
        return stars;
    }
    function getColor(rarity) {
        if (rarity === 1) {
            return 0xffffff;
        } else if (rarity === 2) {
            return 0x20f123;
        } else if (rarity === 3) {
            return 0x1c55ec;
        } else if (rarity === 4) {
            return 0x811bee;
        } else if (rarity === 5) {
            return 0xece91c;
        } else {
            return 0x000000;
        }
    }

    const waifu1 = waifus[0];

    const embed = new EmbedBuilder()
        .setColor(getColor(waifu1.rarity))
        .setImage(waifu1.image)
        .setTitle(user.username + "'s Compendium")
        .setDescription(`Rarity: ${getStars(waifu1.rarity)}`);

    const prev = new ButtonBuilder()
        .setCustomId(`waifu-compendium-prev:${interaction.user.id}`)
        .setLabel("Prev")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const num = new ButtonBuilder()
        .setCustomId(`waifu-compendium-num:${interaction.user.id}`)
        .setLabel(`1/${waifus.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId(`waifu-compendium-next:${interaction.user.id}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(waifus.length <= 1);

    const deleteButton = new ButtonBuilder()
        .setCustomId(`waifu-compendium-delete:${interaction.user.id}`)
        .setLabel("Delete")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(false);

    const row = new ActionRowBuilder().addComponents(
        prev,
        num,
        next,
        deleteButton
    );

    const rsp = await interaction.editReply({
        embeds: [embed],
        components: [row],
    });

    try {
        let index = 0;
        const filter = (interaction) =>
            interaction.customId.startsWith("waifu-compendium");
        const collector = rsp.createMessageComponentCollector({
            filter,
            time: 180_000,
        });
        collector.on("collect", async (i) => {
            if (i.customId.includes("prev")) {
                index--;
                const waifu = waifus[index];
                if (index === 0) {
                    prev.setDisabled(true);
                }
                if (index !== waifus.length - 1) {
                    next.setDisabled(false);
                }
                num.setLabel(`${index + 1}/${waifus.length}`);
                embed
                    .setColor(getColor(waifu.rarity))
                    .setDescription(`Rarity: ${getStars(waifu.rarity)}`)
                    .setImage(waifu.image);
                i.update({ embeds: [embed], components: [row] });
            } else if (i.customId.includes("next")) {
                index++;
                const waifu = waifus[index];
                if (index !== 0) {
                    prev.setDisabled(false);
                }
                if (index === waifus.length - 1) {
                    next.setDisabled(true);
                }
                num.setLabel(`${index + 1}/${waifus.length}`);
                embed
                    .setColor(getColor(waifu.rarity))
                    .setDescription(`Rarity: ${getStars(waifu.rarity)}`)
                    .setImage(waifu.image);
                i.update({ embeds: [embed], components: [row] });
            } else if (i.customId.includes("delete")) {
                if (i.user.id !== waifus[index].uid) {
                    i.reply({
                        content: "You can't delete someone else's waifu!",
                        ephemeral: true,
                    });
                    return;
                }
                await prisma.waifu.delete({ where: { id: waifus[index].id } });
                waifus.splice(index, 1);
                if (waifus.length === 0) {
                    await i.update({
                        content: "No waifus found.",
                        embeds: [],
                        components: [],
                    });
                    return;
                }
                if (index === waifus.length) {
                    index--;
                }
                const waifu = waifus[index];
                if (index === 0) {
                    prev.setDisabled(true);
                } else {
                    prev.setDisabled(false);
                }
                if (index !== waifus.length - 1) {
                    next.setDisabled(false);
                } else {
                    next.setDisabled(true);
                }
                num.setLabel(`${index + 1}/${waifus.length}`);
                embed
                    .setColor(getColor(waifu.rarity))
                    .setDescription(`Rarity: ${getStars(waifu.rarity)}`)
                    .setImage(waifu.image);
                i.update({ embeds: [embed], components: [row] });
            }
        });
        collector.on("end", async () => {
            const prev = new ButtonBuilder()
                .setCustomId(`waifu-compendium-prev:${interaction.user.id}`)
                .setLabel("Prev")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const num = new ButtonBuilder()
                .setCustomId(`waifu-compendium-num:${interaction.user.id}`)
                .setLabel(`1/${waifus.length}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true);

            const next = new ButtonBuilder()
                .setCustomId(`waifu-compendium-next:${interaction.user.id}`)
                .setLabel("Next")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true);

            const deleteButton = new ButtonBuilder()
                .setCustomId(`waifu-compendium-delete:${interaction.user.id}`)
                .setLabel("Delete")
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true);

            const row = new ActionRowBuilder().addComponents(
                prev,
                num,
                next,
                deleteButton
            );
            interaction.editReply({ components: [row] });
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    data,
    category: "fun",
    execute,
};
