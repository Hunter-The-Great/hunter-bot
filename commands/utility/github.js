const {
    SlashCommandBuilder,
    ModalBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const { prisma } = require("../../utilities/db.js");

const data = new SlashCommandBuilder()
    .setName("github")
    .setDescription("GitHub webhook integration.")
    .setDMPermission(true)
    .setNSFW(false)
    .addSubcommand((subcommand) =>
        subcommand.setName("register").setDescription("Registers a webhook.")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("list")
            .setDescription("List of all active endpoints.")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("delete")
            .setDescription("Deletes an endpoint.")
            .addStringOption((option) =>
                option
                    .setName("id")
                    .setDescription("ID of the endpoint to delete.")
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("edit").setDescription("Edits an endpoint.")
    );

const execute = async (interaction) => {
    if (interaction.options.getSubcommand() === "register") {
        //* ----------------------------------------------------------------------- register
        const discriminatorInput = new TextInputBuilder()
            .setCustomId("discriminator")
            .setLabel("ID (<=25):")
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
    } else if (interaction.options.getSubcommand() === "list") {
        //* ----------------------------------------------------------------------- list
        const webhooks = await prisma.gitHubWebhook.findMany({
            where: { uid: interaction.user.id },
        });
        if (webhooks.length === 0) {
            await interaction.reply({
                content: "No endpoints found.",
                ephemeral: true,
            });
            return;
        } else {
            const embed = new EmbedBuilder().setTitle("Endpoints");
            for (const webhook of webhooks) {
                embed.addFields({
                    name: webhook.discriminator,
                    value: `<#${webhook.channelID}>`,
                });
            }
            await interaction.reply({ embeds: [embed] });
            return;
        }
    } else if (interaction.options.getSubcommand() === "delete") {
        //* ----------------------------------------------------------------------- delete
        if (
            !(await prisma.gitHubWebhook.findFirst({
                where: {
                    uid: interaction.user.id,
                    discriminator: interaction.options.getString("id"),
                },
            }))
        ) {
            await interaction.reply({
                content: "Endpoint not found.",
                ephemeral: true,
            });
            return;
        }
        await prisma.gitHubWebhook.deleteMany({
            where: {
                uid: interaction.user.id,
                discriminator: interaction.options.getString("id"),
            },
        });
        await interaction.reply({
            content: "Endpoint deleted.",
            ephemeral: true,
        });
    } else if (interaction.options.getSubcommand() === "edit") {
        const discriminatorInput = new TextInputBuilder()
            .setCustomId("discriminator")
            .setLabel("ID (<=25):")
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
        const endpointInput = new TextInputBuilder()
            .setCustomId("endpoint")
            .setLabel("original ID:")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        const row1 = new ActionRowBuilder().addComponents(endpointInput);
        const row2 = new ActionRowBuilder().addComponents(discriminatorInput);
        const row3 = new ActionRowBuilder().addComponents(channelInput);
        const modal = new ModalBuilder()
            .setCustomId("gh-edit")
            .setTitle(
                `Editing Endpoint /${interaction.options.getString("id")}`
            )
            .addComponents(row1, row2, row3);
        await interaction.showModal(modal);
    }
};

module.exports = {
    data,
    category: "utility",
    execute,
};
