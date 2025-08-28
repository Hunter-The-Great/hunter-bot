import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";

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
    await interaction.reply(
        Math.random() > 0.5
            ? "https://tenor.com/view/yuh-huh-gif-15270611547611670785"
            : "https://tenor.com/view/nuh-uh-beocord-no-lol-gif-24435520"
    );
};

const category = "fun";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
