const { SlashCommandBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Sets a reminder.")
    .setDMPermission(true)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();
    fetch(
        "https://qstash.upstash.io/v1/publish/https://hunter-bot-production.up.railway.app/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer" + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                hello: "world",
            }),
        }
    );
    await interaction.editReply("e");
};

module.exports = {
    data,
    category: "testing",
    execute,
};
