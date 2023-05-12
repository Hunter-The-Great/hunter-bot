const { SlashCommandBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("bored")
    .setDescription("Gives you something to do.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();
    let response;
    try {
        response = await fetch("https://www.boredapi.com/api/activity");
    } catch (err) {
        console.error("Bored API communication failure.");
        await interaction.editReply(
            "Bored API failed to respond, please try again later."
        );
    }
    const data = await response.json();
    await interaction.editReply(data.activity + "\n" + data.link);
};

module.exports = {
    data,
    category: "fun",
    execute,
};
