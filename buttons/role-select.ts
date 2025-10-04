import { ButtonInteraction } from "discord.js";

const name = "role-select";

const execute = async function handleRoleSelection(
  interaction: ButtonInteraction
) {
  const guild = interaction.guild;

  if (!guild) {
    await interaction.reply({
      content: "This command can only be used in a server.",
      ephemeral: true,
    });
    return;
  }

  const member = guild.members.cache.get(interaction.user.id);
  if (!member) {
    await interaction.reply({
      content: "Could not find your user in the server.",
      ephemeral: true,
    });
    return;
  }

  try {
    const role = interaction.customId.split(":")[1];
    let added = false;
    if (member.roles.cache.has(role)) {
      member.roles.remove(role);
    } else {
      await member.roles.add(role);
      added = true;
    }
    await interaction.reply({
      content: `${added ? "Added" : "Removed"} the role "${
        interaction.customId.split(":")[2]
      }".`,
      ephemeral: true,
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content:
        "There was an error updating your roles. Please contact an admin.",
      ephemeral: true,
    });
  }
};

export { name, execute };
