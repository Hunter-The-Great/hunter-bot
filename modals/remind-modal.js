const fetch = require("isomorphic-fetch");
const chrono = require("chrono-node");

const execute = async (interaction) => {
    const time = chrono.parseDate(
        interaction.fields.getTextInputValue("delay")
    );
    const date = new Date(time);
    const reminder = interaction.fields.getTextInputValue("remindercontent");
    const response = await fetch(
        "https://qstash.upstash.io/v1/publish/https://hunter-bot-production.up.railway.app/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
                "Upstash-Not-Before": Math.floor(date.getTime() / 1000),
            },
            body: JSON.stringify({
                key: process.env.KEY,
                uid: interaction.user.id,
                content: reminder,
            }),
        }
    );

    if (!response.ok) {
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
    await interaction.reply({ content: "Reminder set.", ephemeral: true });
};

module.exports = {
    name: "reminder",
    execute,
};
