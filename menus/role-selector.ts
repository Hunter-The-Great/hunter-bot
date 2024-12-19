import { StringSelectMenuInteraction } from "discord.js";

export async function handleRoleSelection(
    interaction: StringSelectMenuInteraction
) {
    const selectedRoles = interaction.values;
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
        for (const role of selectedRoles) {
            if (member.roles.cache.has(role)) {
                member.roles.remove(role);
            } else {
                await member.roles.add(selectedRoles);
            }
        }
        await interaction.reply({
            content: "Your roles have been updated!",
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
}
