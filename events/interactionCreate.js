const { Events } = require("discord.js");
const { log } = require("../utilities/log.js");
const reminder = require("../modals/remind-modal.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    if (interaction.isChatInputCommand()) {
        try {
            const command = interaction.client.commands.get(
                interaction.commandName
            );
            await command.execute(interaction);
        } catch (err) {
            console.error("An error has occurred:\n", err);
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
                console.log("\nA message could not be sent");
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
                subcommand: interaction.options._subcommand,
            };
            await log("commands", payload);
        } catch (err) {
            console.error("Axiom communications failure:\n", err);
        }
    } else if (interaction.isModalSubmit()) {
        reminder.execute(interaction);
    } else {
        return;
    }
};

module.exports = {
    name,
    execute,
};
