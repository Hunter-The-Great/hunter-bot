import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import fs from "fs";

const data = new SlashCommandBuilder()
    .setName("l")
    .setDescription("Sends the L L.")
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
    .addBooleanOption((option) =>
        option
            .setName("prime")
            .setDescription("Makes the L L prime.")
            .setRequired(false)
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const data = interaction.options.getBoolean("prime")
        ? fs.readFileSync("resources/l-prime.txt", "utf8")
        : fs.readFileSync("resources/l.txt", "utf-8");
    await interaction.reply(data);
};

const category = "fun";

export { data, category, execute };
