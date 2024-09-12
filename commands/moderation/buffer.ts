import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
} from "discord.js";
import fs from "fs";

const data = new SlashCommandBuilder()
    .setName("buffer")
    .setDescription("Sends a buffer of empty space.")
    .setNSFW(false)
    .setContexts([
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ])
    .addBooleanOption((option) =>
        option
            .setName("ephemeral")
            .setDescription("Sets whether the buffer is ephemeral or not.")
            .setRequired(false)
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const data = fs.readFileSync("resources/buffer.txt", "utf8");
    interaction.options.getBoolean("ephemeral");
    await interaction.reply({
        content: data,
        ephemeral: interaction.options.getBoolean("ephemeral") ?? true,
    });
};

const category = "moderation";

export { data, category, execute };
