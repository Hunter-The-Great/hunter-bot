const { Events } = require("discord.js");
const { axiom, ContentEncoding, ContentType } = require("../utilities/log.js");
require("isomorphic-fetch");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    let command;

    try {
        command = interaction.client.commands.get(interaction.commandName);
    } catch (err) {
        console.error("A bad error has occurred:\n", err);
    }
    try {
        await command.execute(interaction);
    } catch (err) {
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply(
                    "An error has occured, please try again later."
                );
            } else {
                await interaction.reply(
                    "An error has occured, please try again later."
                );
            }
        } catch (err1) {
            console.error(
                "An error has occurred and a message could not be sent:\n",
                err1
            );
            return;
        }
        console.error("An error has occurred:\n", err);
    }
    try {
        const data = JSON.stringify([
            { users: interaction.user.tag },
            { cmds: command.name },
        ]);
        await axiom.ingest(
            "commands",
            data,
            ContentType.JSON,
            ContentEncoding.Identity
        );
    } catch (err) {
        console.error("Axiom communications failure:\n", err);
    }
};

module.exports = {
    name,
    execute,
};
