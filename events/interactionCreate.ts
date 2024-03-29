import { Events, Interaction } from "discord.js";
import { log } from "../utilities/log.js";
import { checkPermissions } from "../utilities/permission-check.js";
import { sentry } from "../utilities/sentry.js";

const name = Events.InteractionCreate;

const execute = async (interaction: Interaction) => {
    if (!interaction) {
        console.log("interaction is undefined");
        return;
    }
    if (interaction.user.bot) {
        return;
    }
    if (interaction.isButton()) {
        //* buttons
        try {
            if (interaction.customId.endsWith(interaction.user.id)) {
                return;
            }
            if (interaction.customId.startsWith("waifu-save")) {
                return interaction.reply({
                    content: "This is not the waifu you're looking for.",
                    ephemeral: true,
                });
            }
            return;
        } catch (err) {
            console.error("An error has occurred:\n", err);
            sentry.captureException(err);
        }
    }
    if (interaction.isChatInputCommand()) {
        //* slash commands
        try {
            //@ts-ignore
            const command = interaction.client.commands.get(
                interaction.commandName
            );
            if (!command) {
                throw new Error(
                    `Command "${interaction.commandName}" not found`
                );
            }
            if (command.category === "moderation") {
                if (
                    !(await checkPermissions(
                        interaction.user,
                        interaction.channel
                    ))
                ) {
                    interaction.reply(
                        "Insufficient permissions to use this command."
                    );
                    return;
                }
            }
            await command.execute(interaction);
        } catch (err) {
            console.error("An error has occurred:\n", err);
            sentry.captureException(err);
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
                // Maybe log with sentry here?
                return;
            }
        }
        //* command logging
        try {
            const payload = {
                user: interaction.user.username,
                command: interaction.commandName,
                //@ts-ignore
                ...interaction.options._hoistedOptions.reduce((acc, params) => {
                    return { [params.name]: params.value, ...acc };
                }, {}),
                //@ts-ignore
                subcommand: interaction.options._subcommand,
            };
            await log("commands", payload);
        } catch (err) {
            console.error("Axiom communications failure:\n", err);
            sentry.captureException(err);
        }
    } else if (interaction.isModalSubmit()) {
        //* modals
        try {
            //@ts-ignore
            const modal = interaction.client.modals.get(interaction.customId);
            await modal.execute(interaction);
        } catch (err) {
            console.error("An error has occurred:\n", err);
            sentry.captureException(err);
        }
    } else {
        return;
    }
};

export { name, execute };
