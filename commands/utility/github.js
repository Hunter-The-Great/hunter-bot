const {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("github")
    .setDescription("GitHub webhook integration.")
    .setDMPermission(true)
    .setNSFW(false)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("register")
            .setDescription("Registers a webhook.")
            .addStringOption((option) =>
                option
                    .setName("discriminator")
                    .setDescription(
                        "The custom discriminator to use for the endpoint."
                    )
                    .setRequired(false)
                    .setMaxLength(25)
            )
    );

const execute = async (interaction) => {
    const discriminatorInput = new TextInputBuilder()
        .setCustomId("discriminator")
        .setLabel("Discriminator (<=25):")
        .setPlaceholder("leave blank for random")
        .setMaxLength(25)
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
    const channelInput = new TextInputBuilder()
        .setCustomId("channel")
        .setLabel("Channel:")
        .setPlaceholder("Requires admin privileges.")
        .setRequired(false)
        .setStyle(TextInputStyle.Short);
    const row1 = new ActionRowBuilder().addComponents(discriminatorInput);
    const row2 = new ActionRowBuilder().addComponents(channelInput);
    const modal = new ModalBuilder()
        .setCustomId("gh-register")
        .setTitle("Endpoint Generator")
        .addComponents(row1, row2);
    await interaction.showModal(modal);
};

module.exports = {
    data,
    category: "utility",
    execute,
};
