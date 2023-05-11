const { Events } = require("discord.js");
const { log } = require("../utilities/log.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        const command = interaction.client.commands.get(
            interaction.commandName
        );
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
                err
            );
            return;
        }
        console.error("An error has occurred:\n", err);
    }
    try {
        const payload = {
            user: interaction.user.tag,
            command: interaction.commandName,
            ...interaction.options._hoistedOptions.reduce((acc, params) => {
                return { [params.name]: params.value, ...acc };
            }, {}),
            subcommand: interaction.options.getSubcommand()
                ? interaction.options.getSubcommand()
                : null,
        };
        await log("commands", payload);
    } catch (err) {
        console.error("Axiom communications failure:\n", err);
    }
};

module.exports = {
    name,
    execute,
};
