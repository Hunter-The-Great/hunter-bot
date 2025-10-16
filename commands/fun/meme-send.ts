import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import { sendMeme } from "../../functions/sendMeme";

const data = new SlashCommandBuilder()
  .setName("meme-send")
  .setDescription("Sends a meme.")
  .setNSFW(false)
  .setContexts([
    InteractionContextType.BotDM,
    InteractionContextType.Guild,
    InteractionContextType.PrivateChannel,
  ])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addStringOption((option) =>
    option.setName("link").setDescription("Link to meme.").setRequired(true)
  );

const execute = async (interaction: ChatInputCommandInteraction) => {
  const link = interaction.options.getString("link");
  if (!link) {
    await interaction.reply({
      content: "Error processing link.",
      ephemeral: true,
    });
    return;
  }
  const user =
    interaction.user.globalName ?? interaction.user.username ?? "unknown";

  interaction.deferReply({ ephemeral: true });

  try {
    await sendMeme(interaction.client, user, link);
    await interaction.editReply("Meme sent.");
  } catch (err) {
    await interaction.editReply("Error processing link.");
  }
};

const category = "fun";
const scopes = [Scopes.kos, Scopes.testing];

export { data, category, scopes, execute };
