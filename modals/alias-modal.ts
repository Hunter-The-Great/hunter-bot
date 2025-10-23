import { ModalSubmitInteraction } from "discord.js";
import { prisma } from "../utilities/db";

const name = "alias-modal";

const execute = async (interaction: ModalSubmitInteraction) => {
  const alias = interaction.fields.getTextInputValue("alias-update");
  const originalAlias = interaction.customId.split(":")[1];
  const user = interaction.user;

  if (await prisma.gif.findFirst({ where: { uid: user.id, alias } })) {
    interaction.reply({ content: "Alias already in use.", ephemeral: true });
    return;
  }

  const regex = /^[A-Za-z0-9\s-_,.]+$/;
  if (!alias.match(regex) || alias.toLowerCase() === "null") {
    await interaction.reply({
      content:
        'Error: invalid input, please provide an alias with only alphanumeric characters, whitespace, and the characters " , . - _ ".',
      ephemeral: true,
    });
    return;
  }

  await prisma.gif.updateMany({
    where: { uid: user.id, alias: originalAlias },
    data: { alias: alias },
  });

  await interaction.reply({
    content:
      "Alias updated succesfully. NOTE: changes will not reflect in your compendium without re-running the command.",
    ephemeral: true,
  });
};

export { name, execute };
