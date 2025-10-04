import { ButtonInteraction, GuildMember } from "discord.js";

const name = "role-check";

const execute = async (interaction: ButtonInteraction) => {
  if (!interaction.inGuild()) return;
  const member = interaction.member;
  if (!(member instanceof GuildMember)) return;

  const roles = member.roles.cache
    .map((role) => role.name)
    .filter((role) => role !== "@everyone");
  interaction.reply({
    content: `You have the following roles: \n- ${roles.join("\n- ")}`,
    ephemeral: true,
  });
};

export { name, execute };
