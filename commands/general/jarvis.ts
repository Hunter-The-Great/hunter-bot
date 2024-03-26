import {
    SlashCommandBuilder,
    PermissionsBitField,
    ChatInputCommandInteraction,
} from "discord.js";
import { prisma } from "../../utilities/db";

const data = new SlashCommandBuilder()
    .setName("jarvis")
    .setDescription("Toggles Jarvis mode.")
    .setDMPermission(false)
    .setNSFW(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addBooleanOption((option) =>
        option
            .setName("status")
            .setDescription("Turns Jarvis on/off")
            .setRequired(true)
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) throw new Error("Is this even possible?");
    await prisma.guild.upsert({
        where: { id: interaction.guild.id },
        update: { jarvis: interaction.options.getBoolean("status")! },
        create: {
            id: interaction.guild.id,
            jarvis: interaction.options.getBoolean("status")!,
        },
    });

    if (interaction.options.getBoolean("status")) {
        await interaction.reply({
            content: "At your service.",
            ephemeral: false,
        });
    } else {
        await interaction.reply({
            content: "Jarvis has been disabled.",
            ephemeral: false,
        });
    }
};

const category = "general";

export { data, category, execute };
