import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";

const data = new SlashCommandBuilder()
    .setName("db-update")
    .setDescription("Updates the database schema.")
    .setNSFW(false)
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall]);

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply("Updating database...");

    const { exec } = require("child_process");
    exec(
        "bun run db-gen && bun run db-push",
        async (error: any, stdout: any) => {
            if (error) {
                await interaction.editReply(`exec error: ${error}`);
                return;
            }
            await interaction.editReply(`stdout: ${stdout}`);
        }
    );
};

const category = "admin";
const scopes = [Scopes.admin];

export { data, category, scopes, execute };
