const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("xkcd")
    .setDescription("Shows an XKCD comic.")
    .addStringOption((option) =>
        option
            .setName("number")
            .setDescription("The number of the comic to show.")
            .setRequired(false)
    )
    .addBooleanOption((option) =>
        option
            .setName("latest")
            .setDescription("Show the latest comic?")
            .setRequired(false)
    )
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();

    if (interaction.options.getBoolean("latest")) {
        const response = await fetch(`https://xkcd.com/info.0.json`);
        if (!response.ok) {
            await interaction.editReply("XKCD API failed to respond.");
            return;
        }
        const data = await response.json();
        const embed = new EmbedBuilder()
            .setTitle(data.safe_title)
            .setDescription(data.alt)
            .setImage(data.img)
            .setFooter({ text: `XKCD #${data.num}` })
            .setColor(0x00ffff);
        await interaction.editReply({ embeds: [embed] });
        return;
    }

    const max = await fetch("https://xkcd.com/info.0.json").then(
        async (res) => await res.json().then((res2) => res2.num)
    );

    const index =
        interaction.options.getString("number") ||
        Math.floor(Math.random() * max) + 1;

    if (index > max || index < 1) {
        await interaction.editReply("Invalid comic number.");
        return;
    }

    const response = await fetch(`https://xkcd.com/${index}/info.0.json`);
    if (!response.ok) {
        await interaction.editReply("XKCD API failed to respond.");
        return;
    }
    const data = await response.json();
    const embed = new EmbedBuilder()
        .setTitle(data.safe_title)
        .setDescription(data.alt)
        .setImage(data.img)
        .setFooter({ text: `XKCD #${data.num}` })
        .setColor(0x00ffff);
    await interaction.editReply({ embeds: [embed] });
};

module.exports = {
    data,
    category: "fun",
    execute,
};
