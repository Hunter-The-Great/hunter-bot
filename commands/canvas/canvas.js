const {
    SlashCommandBuilder,
    ModalBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require("discord.js");
const { prisma } = require("../../utilities/db.js");
const { decrypt } = require("../../utilities/encryption.js");

const data = new SlashCommandBuilder()
    .setName("canvas")
    .setDescription("Modifying Canvas token.")
    .setDMPermission(true)
    .setNSFW(false)
    .addSubcommand((subcommand) =>
        subcommand.setName("register").setDescription("Registers a token.")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("show").setDescription("Lists your token.")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("delete").setDescription("Deletes your token.")
    );

const execute = async (interaction) => {
    const command = interaction.options.getSubcommand();
    if (command === "register") {
        const tokenInput = new TextInputBuilder()
            .setCustomId("token")
            .setLabel("Token:")
            .setPlaceholder("WARNING: will replace any existing token.")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        const row1 = new ActionRowBuilder().addComponents(tokenInput);

        const modal = new ModalBuilder()
            .setCustomId("canvas-register")
            .setTitle("Canvas Registration")
            .addComponents(row1);
        await interaction.showModal(modal);
    } else if (command === "show") {
        const rawToken = (
            await prisma.user.findUnique({
                where: { id: interaction.user.id },
            })
        ).canvasToken;

        if (!rawToken) {
            await interaction.reply({
                content: "No token found.",
                ephemeral: true,
            });
            return;
        }

        const token = await decrypt(rawToken);

        await interaction.reply({
            content: token,
            ephemeral: true,
        });
    } else if (command === "delete") {
        await prisma.user.update({
            where: { id: interaction.user.id },
            data: { canvasToken: null },
        });

        await interaction.reply({
            content: "Token deleted.",
            ephemeral: true,
        });
    }
};

module.exports = {
    data,
    category: "canvas",
    execute,
};
