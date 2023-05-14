const fetch = require("isomorphic-fetch");

const execute = async (interaction) => {
    const delay = interaction.fields.getTextInputValue("delay");
    const reminder = interaction.fields.getTextInputValue("remindercontent");
    fetch(
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
};

module.exports = {
    name: "remind",
    execute,
};
