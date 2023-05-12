const { SlashCommandBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("bored")
    .setDescription("Gives you something to do.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    const response = await fetch("https://www.boredapi.com/api/activity");
    const data = await response.json();
    await interaction.reply(data.activity + "\n" + data.link);
};

module.exports = {
    data,
    category: "fun",
    execute,
};
