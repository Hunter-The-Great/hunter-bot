const { Events } = require("discord.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    let command;

    try {
        command = interaction.client.commands.get(interaction.commandName);
    } catch (err) {
        console.error("A bad error has occurred: \n", err);
    }
    try {
        await command.execute(interaction);
    } catch (err) {
        try {
            if (interaction.deferred || interaction.replied) {
                interaction.editReply(
                    "An error has occurred, please try again later."
                );
            } else {
                interaction.reply(
                    "An error has occurred, please try again later."
                );
            }
        } catch (err1) {
            console.error("An error has REALLY occurred: \n", err);
            return;
        }
        console.error("An error has ocurred: \n", err);
    }
};

module.exports = {
    name,
    execute,
};
