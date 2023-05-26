const fetch = require("isomorphic-fetch");
const chrono = require("chrono-node");

const execute = async (interaction) => {
    const reminder = interaction.fields.getTextInputValue("remindercontent");
    const delay = interaction.fields.getTextInputValue("delay");
    const time = chrono.parseDate(interaction.fields.getTextInputValue("date"));

    const date = new Date(time);

    if (date.toString() === "Invalid Date") {
        interaction.reply({
            content: "Error processing date.",
        });
        return;
    } else {
        const regex = /^[0-9]+$/;
        if (!delay.match(regex)) {
            interaction.reply({
                content: "Error processing delay.",
            });
            return;
        }
    }

    console.log({
        "Upstash-Not-Before": time
            ? Math.floor(date.getTime() / 1000)
            : undefined,
        "Upstash-Delay": delay,
    });

    const response = await fetch(
        "https://qstash.upstash.io/v1/publish/https://hunter-bot-production.up.railway.app/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
                "Upstash-Not-Before": time
                    ? Math.floor(date.getTime() / 1000)
                    : undefined,
                "Upstash-Delay": `${delay}m`,
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
