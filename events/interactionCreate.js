const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const command = interaction.client.commands.get(
            interaction.commandName
        );
        command.execute(interaction);
    },
};
