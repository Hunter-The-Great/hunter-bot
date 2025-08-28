import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    ApplicationIntegrationType,
    InteractionContextType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import fs from "fs";
import { checkPermissions } from "../../utilities/permission-check";

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
    let ephemeral = interaction.options.getBoolean("ephemeral") ?? true;

    if (
        !ephemeral &&
        !(await checkPermissions(interaction.user, interaction.channel))
    )
        ephemeral = true;

    await interaction.reply({
        content: data,
        ephemeral,
    });
};

const category = "moderation";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
