const { Events } = require("discord.js");
const { log } = require("../utilities/log.js");

const name = Events.InteractionCreate;

const execute = async (interaction) => {
    if (!interaction) {
        console.log("interaction is undefined");
        return;
    }
    if (interaction.isButton()) {
        //* -------------------------------------------------------------------- buttons
        try {
            if (
                !(
                    interaction.customId.startsWith("waifu-compendium-prev") ||
                    interaction.customId.startsWith("waifu-compendium-next") ||
                    interaction.customId.startsWith("waifu-compendium-delete")
                )
            ) {
                if (!interaction.customId.endsWith(interaction.user.id)) {
                    if (interaction.customId.startsWith("waifu-save")) {
                        return interaction.reply({
                            content:
                                "This is not the waifu you're looking for.",
                            ephemeral: true,
                        });
                    } else {
                        return interaction.reply({
                            content:
                                "This is not the button you're looking for.",
                            ephemeral: true,
                        });
                    }
                }
            }
        } catch (err) {
            console.error("An error has occurred:\n", err);
        }
    }
    if (interaction.isChatInputCommand()) {
        //* -------------------------------------------------------------------- slash commands
        try {
            const command = interaction.client.commands.get(
                interaction.commandName
            );
            if (!command) {
                throw new Error(
                    `Command "${interaction.commandName}" not found`
                );
            }
            await command.execute(interaction);
        } catch (err) {
            console.error("An error has occurred:\n", err);
            try {
                if (interaction.isRepliable()) {
                    if (interaction.replied || interaction.deferred) {
                        await interaction.editReply(
                            "An error has occured, please try again later."
                        );
                    } else {
                        await interaction.reply(
                            "An error has occured, please try again later."
                        );
                    }
                }
            } catch (err1) {
                console.log("\nA message could not be sent");
                return;
            }
        }
        //* -------------------------------------------------------------------- command logging
        try {
            const payload = {
                user: interaction.user.username,
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
        //* -------------------------------------------------------------------- modals
        try {
            const modal = interaction.client.modals.get(interaction.customId);
            await modal.execute(interaction);
        } catch (err) {
            console.error("An error has occurred:\n", err);
        }
    } else {
        return;
    }
};

module.exports = {
    name,
    execute,
};
