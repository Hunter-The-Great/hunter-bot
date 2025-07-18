import { ModalSubmitInteraction } from "discord.js";
import { sentry } from "../utilities/sentry";

const chrono = require("chrono-node");

const name = "reminder";

const execute = async (interaction: ModalSubmitInteraction) => {
    const reminder = interaction.fields.getTextInputValue("remindercontent");
    const delay = interaction.fields.getTextInputValue("delay");
    const time = chrono.parseDate(interaction.fields.getTextInputValue("date"));

    const date = new Date(time!);

    if (date.toString() === "Invalid Date") {
        interaction.reply({
            content: "Error processing date.",
            ephemeral: true,
        });
        return;
    } else if (delay) {
        const regex = /^[0-9]+$/;
        if (!delay.match(regex)) {
            interaction.reply({
                content: "Error processing delay.",
                ephemeral: true,
            });
            return;
        }
    }

    const getParams = (time, date, delay): Record<string, string> => {
        if (time) {
            return {
                "Upstash-Not-Before": Math.floor(
                    date.getTime() / 1000
                ).toString(),
            };
        } else {
            return { "Upstash-Delay": `${delay}m` };
        }
    };

    const response = await fetch(
        "https://qstash.upstash.io/v2/publish/https://hunter-bot.lowryb.sbs/reminders",
        {
            method: "POST",
            headers: {
                Authorization: "Bearer " + process.env.QSTASH_TOKEN,
                "Content-type": "application/json",
                ...getParams(time, date, delay),
            },
            body: JSON.stringify({
                key: process.env.KEY,
                uid: interaction.user.id,
                content: reminder,
            }),
        }
    );
    if (!response.ok) {
        if (response.status === 412) {
            await interaction.reply({
                content: "Date too far in the future.",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "Failed to set reminder, please try again later.",
                ephemeral: true,
            });
        }
        sentry.captureEvent({
            message: "Failed to set reminder",
            extra: {
                status: response.status,
                statusText: response.statusText,
            },
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

export { name, execute };
