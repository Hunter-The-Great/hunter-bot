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
            console.error("An error has REALLY occurred: \n", err1);
            return;
        }
        console.error("An error has occurred: \n", err);
    }
};

module.exports = {
    name,
    execute,
};
