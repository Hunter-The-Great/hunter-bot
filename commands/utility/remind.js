const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Sets a reminder.")
    .setDMPermission(true)
    .setNSFW(false);

const execute = async (interaction) => {
    //await interaction.deferReply();
    const delayInput = new TextInputBuilder()
        .setCustomId("delay")
        .setLabel("Date:")
        .setPlaceholder("MM/DD/YY HH:MM (UTC) [Don't forget Daylight Savings]")
        .setStyle(TextInputStyle.Short);

    const reminderInput = new TextInputBuilder()
        .setCustomId("remindercontent")
        .setLabel("Reminder:")
        .setStyle(TextInputStyle.Paragraph);

    const row1 = new ActionRowBuilder().addComponents(delayInput);
    const row2 = new ActionRowBuilder().addComponents(reminderInput);

    const modal = new ModalBuilder()
        .setCustomId("reminder")
        .setTitle("Reminder")
        .addComponents(row1, row2);

    await interaction.showModal(modal);
};

module.exports = {
    data,
    category: "utility",
    execute,
};
