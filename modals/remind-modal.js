const fetch = require("isomorphic-fetch");

const execute = async (interaction) => {
    const delay = interaction.fields.getTextInputValue("delay");
    const reminder = interaction.fields.getTextInputValue("remindercontent");
    const response = fetch(
        "https://qstash.upstash.io/v1/publish/https://hunter-bot-production.up.railway.app/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
                "Upstash-Delay": `${delay}m`,
            },
            body: JSON.stringify({
                uid: interaction.user.id,
                content: reminder,
            }),
        }
    );
    if (response.status !== 201) {
        await interaction.reply({
            content: "Failed to set reminder, please try again later.",
        });
        console.log(
            "Upstash communication failure, code: " +
                response.status +
                "\n\n" +
                response.statusText
        );
        return;
    }
    await interaction.reply({ content: "Reminder set." });
};

module.exports = {
    name: "remind",
    execute,
};
