import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import fs from "fs";

const data = new SlashCommandBuilder()
    .setName("w")
    .setDescription("Sends the W W.")
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
    const data = fs.readFileSync("resources/w.txt", "utf8");
    await interaction.reply(data);
};

const category = "fun";

export { data, category, execute };
