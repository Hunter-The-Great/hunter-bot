import {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalActionRowComponentBuilder,
    ChatInputCommandInteraction,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Sets a reminder.")
    .setDMPermission(true)
    .setNSFW(false);

const execute = async (interaction: ChatInputCommandInteraction) => {
    const dateInput = new TextInputBuilder()
        .setCustomId("date")
        .setLabel("Date:")
        .setPlaceholder("MM/DD/YY HH:MM PM UTC [Don't forget Daylight Savings]")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

    const delayInput = new TextInputBuilder()
        .setCustomId("delay")
        .setLabel("Delay:")
        .setPlaceholder("minutes")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);

    const reminderInput = new TextInputBuilder()
        .setCustomId("remindercontent")
        .setLabel("Reminder:")
        .setValue("This is a reminder.")
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

    const row1 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            dateInput
        );
    const row2 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            delayInput
        );
    const row3 =
        new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
            reminderInput
        );

    const modal = new ModalBuilder()
        .setCustomId("reminder")
        .setTitle("Reminder")
        .addComponents(row1, row2, row3);

    await interaction.showModal(modal);
};

const category = "utility";

export { data, category, execute };
