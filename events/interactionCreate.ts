import { Events, Interaction } from "discord.js";
import { sentry } from "../utilities/sentry.js";
import { posthog } from "../utilities/posthog.js";

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
    try {
      const button = interaction.client.buttons.get(
        interaction.customId.split(":")[0]
      );
      if (button) {
        await button.execute(interaction);
        return;
      }

      // access control
      if (interaction.customId.endsWith(interaction.user.id)) {
        return;
      }
      if (interaction.customId.startsWith("waifu-save")) {
        return interaction.reply({
          content: "This is not the waifu you're looking for.",
          ephemeral: true,
        });
      }
    } catch (err) {
      console.error("An error has occurred:\n", err);
      sentry.captureException(err);
    }
  } else if (interaction.isChatInputCommand()) {
    try {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) {
        throw new Error(`Command "${interaction.commandName}" not found`);
      }
      await command.execute(interaction);
    } catch (err) {
      console.error("An error has occurred:\n", err);
      sentry.captureException(err);
      try {
        if (interaction.isRepliable()) {
          if (interaction.replied || interaction.deferred) {
            await interaction.editReply(
              "An error has occurred, please try again later."
            );
          } else {
            await interaction.reply(
              "An error has occurred, please try again later."
            );
          }
        }
      } catch (err1) {
        console.log("\nA message could not be sent");
        // Maybe log with sentry here?
        return;
      }
    }
    // command logging
    try {
      posthog.capture({
        event: "command",
        distinctId: interaction.user.id,
        properties: {
          user: interaction.user.username,
          guild: interaction.guild?.name,
          name: interaction.commandName,
          //@ts-ignore
          subcommand: interaction.options._subcommand,
          //@ts-ignore
          options: interaction.options._hoistedOptions,
        },
      });
    } catch (err) {
      console.error("Posthog Error:\n", err);
      sentry.captureException(err);
    }
  } else if (interaction.isModalSubmit()) {
    try {
      const modal = interaction.client.modals.get(
        interaction.customId.split(":")[0]
      );
      await modal.execute(interaction);
      if (interaction.customId === "feedback") return; // I said it was anonymous didn't I?
      // modal logging
      try {
        posthog.capture({
          event: "modal",
          distinctId: interaction.user.id,
          properties: {
            user: interaction.user.username,
            guild: interaction.guild?.name,
            name: interaction.customId,
            options: interaction.fields.fields,
          },
        });
      } catch (err) {
        console.error("Posthog Error:\n", err);
        sentry.captureException(err);
      }
    } catch (err) {
      console.error("An error has occurred:\n", err);
      sentry.captureException(err);
    }
  } else {
    return;
  }
};

export { name, execute };
