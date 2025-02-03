import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("flip")
    .setDescription("Flips a coin.")
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
    await interaction.reply(Math.random() > 0.5 ? "Heads" : "Tails");
};

const category = "fun";

export { data, category, execute };
