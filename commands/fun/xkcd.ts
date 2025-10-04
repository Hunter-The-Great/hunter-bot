import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";

const data = new SlashCommandBuilder()
  .setName("xkcd")
  .setDescription("Shows an XKCD comic.")
  .addStringOption((option) =>
    option
      .setName("number")
      .setDescription("The number of the comic to show.")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("latest")
      .setDescription("Show the latest comic?")
      .setRequired(false)
  )
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

  if (interaction.options.getBoolean("latest")) {
    const response = await fetch(`https://xkcd.com/info.0.json`);
    if (!response.ok) {
      await interaction.editReply("XKCD API failed to respond.");
      return;
    }
    const data = await response.json();
    const embed = new EmbedBuilder()
      .setTitle(data.safe_title)
      .setDescription(data.alt)
      .setImage(data.img)
      .setFooter({ text: `XKCD #${data.num}` })
      .setColor(0x00ffff);
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const max = await fetch("https://xkcd.com/info.0.json").then(
    async (res) => await res.json().then((res2) => res2.num)
  );

  const number = interaction.options.getString("number");
  let index: number;
  if (number) index = parseInt(number);
  else index = Math.floor(Math.random() * max) + 1;

  if (index > max || index < 1) {
    await interaction.editReply("Invalid comic number.");
    return;
  }

  const response = await fetch(`https://xkcd.com/${index}/info.0.json`);
  if (!response.ok) {
    await interaction.editReply("XKCD API failed to respond.");
    return;
  }
  const data = await response.json();
  const embed = new EmbedBuilder()
    .setTitle(data.safe_title)
    .setDescription(data.alt)
    .setImage(data.img)
    .setFooter({ text: `XKCD #${data.num}` })
    .setColor(0x00ffff);
  await interaction.editReply({ embeds: [embed] });
};

const category = "fun";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
