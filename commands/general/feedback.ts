import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Provides feedback to the author of this bot.")
    .setDMPermission(true)
    .setNSFW(false);

const execute = async (interaction: ChatInputCommandInteraction) => {
    const input = new TextInputBuilder()
        .setCustomId("input")
        .setLabel("Put your feedback here:")
        .setPlaceholder("All feedback is anonymous.")
        .setRequired(true)
        .setMaxLength(500)
        .setStyle(TextInputStyle.Paragraph);
    const row =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            input
        );
    const modal = new ModalBuilder()
        .setCustomId("feedback")
        .setTitle("Feedback Form")
        .addComponents(row);

    await interaction.showModal(modal);
};

const category = "general";

export { data, category, execute };
