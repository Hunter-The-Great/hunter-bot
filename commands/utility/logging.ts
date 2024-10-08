import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionsBitField,
    ApplicationIntegrationType,
    InteractionContextType,
} from "discord.js";
import { prisma } from "../../utilities/db";

const data = new SlashCommandBuilder()
    .setName("logging")
    .setDescription("Toggles logging on/off.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])

    .addBooleanOption((option) =>
        option
            .setName("status")
            .setDescription("Toggles logging on/off.")
            .setRequired(true)
    );
const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();
    await prisma.guild.upsert({
        where: {
            id: interaction.guild!.id,
        },
        update: {
            logging: interaction.options.getBoolean("status")!,
        },
        create: {
            id: interaction.guild!.id,
            logging: interaction.options.getBoolean("status")!,
        },
    });
    await interaction.editReply({
        content: `Succesfully set logging to ${interaction.options
            .getBoolean("status")!
            .toString()}`,
    });
};

const category = "utility";

export { data, category, execute };
