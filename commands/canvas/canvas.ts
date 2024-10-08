import {
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ModalActionRowComponentBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import { prisma } from "../../utilities/db.js";
import { decrypt } from "../../utilities/encryption.js";

const data = new SlashCommandBuilder()
    .setName("canvas")
    .setDescription("Modifying Canvas token.")
    .setNSFW(false)
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])
    .addSubcommand((subcommand) =>
        subcommand.setName("register").setDescription("Registers a token.")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("show").setDescription("Lists your token.")
    )
    .addSubcommand((subcommand) =>
        subcommand.setName("delete").setDescription("Deletes your token.")
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const command = interaction.options.getSubcommand();
    if (command === "register") {
        const tokenInput = new TextInputBuilder()
            .setCustomId("token")
            .setLabel("Token:")
            .setPlaceholder("WARNING: will replace any existing token.")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);
        const row1 =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                tokenInput
            );

        const modal = new ModalBuilder()
            .setCustomId("canvas-register")
            .setTitle("Canvas Registration")
            .addComponents(row1);
        await interaction.showModal(modal);
    } else if (command === "show") {
        const user = await prisma.user.findUnique({
            where: { id: interaction.user.id },
        });
        const rawToken = user?.canvasToken;

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
    } else {
        console.log(`ERROR: subcommand not found for /canvas: ${command}`);
        await interaction.reply("An error occured, please try again later.");
    }
};

const category = "canvas";

export { data, category, execute };
