import {
    ApplicationIntegrationType,
    ChatInputCommandInteraction,
    InteractionContextType,
    SlashCommandBuilder,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("bored")
    .setDescription("Gives you something to do.")
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
    await interaction.deferReply();

    const response = await fetch("https://api.lowryb.sbs/bored");
    if (!response.ok) {
        console.error(
            "Bored API failed to respond.\n",
            response.status,
            response.statusText
        );
        await interaction.editReply(
            "Bored API failed to respond, please try again later."
        );
        return;
    }
    const data = await response.json();
    await interaction.editReply(data.activity + "\n" + data.link);
};

const category = "fun";

export { data, category, execute };
