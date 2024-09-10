import {
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    InteractionContextType,
    SlashCommandBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("id")
    .setDescription("Tells you your user ID.")
    .setNSFW(false)
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ]);

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content: "Your user ID is: " + interaction.user.id,
        ephemeral: true,
    });
};

const category = "utility";

export { data, category, execute };
