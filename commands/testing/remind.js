const { SlashCommandBuilder } = require("discord.js");
const fetch = require("isomorphic-fetch");

const data = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Sets a reminder.")
    .addIntegerOption((option) =>
        option
            .setName("delay")
            .setDescription("Number of minutes to delay the reminder.")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("reminder")
            .setDescription("The thing to be reminded about.")
            .setRequired(true)
    )
    .setDMPermission(true)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();
    fetch(
        "https://qstash.upstash.io/v1/publish/https://hunter-bot-production.up.railway.app/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
                "Upstash-Delay": `${interaction.options.getInteger("delay")}m`,
            },
            body: JSON.stringify({
                uid: interaction.user.id,
                content: interaction.options.getString("reminder"),
            }),
        }
    );
    await interaction.editReply("Reminder set.");
};

module.exports = {
    data,
    category: "testing",
    execute,
};
