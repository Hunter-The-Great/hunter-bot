const { Events } = require("discord.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    const command = interaction.client.commands.get(interaction.commandName);
    await command.execute(interaction);
};

module.exports = {
    name,
    execute,
};
