const { Events } = require("discord.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);
    try {
        await command.execute(interaction);
    } catch (err) {
        console.error("An error has ocurred.", err);
    }
};

module.exports = {
    name,
    execute,
};
