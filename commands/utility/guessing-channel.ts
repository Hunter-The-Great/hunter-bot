import {
  SlashCommandBuilder,
  PermissionsBitField,
  ChatInputCommandInteraction,
  CategoryChannel,
  VoiceChannel,
  EmbedBuilder,
  ApplicationIntegrationType,
  InteractionContextType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import { prisma } from "../../utilities/db";
import { sentry } from "../../utilities/sentry";

const data = new SlashCommandBuilder()
  .setName("guessing-channel")
  .setDescription(
    "Handles channels used for guessing game when message logging is off."
  )
  .setNSFW(false)
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .setContexts([InteractionContextType.Guild])
  .setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
  .addSubcommand((subcommand) =>
    subcommand
      .setName("register")
      .setDescription("registers a channel to be used for guessing game.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to register.")
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Unregisters a channel.")
      .addChannelOption((option) =>
        option
          .setName("channel")
          .setDescription("The channel to unregister")
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("list")
      .setDescription("Lists all active channels for guessing game.")
  );
const execute = async (interaction: ChatInputCommandInteraction) => {
  const command = interaction.options.getSubcommand();
  await interaction.deferReply();
  const channel =
    interaction.options.getChannel("channel")?.id || interaction.channel!.id;
  const channelType = await interaction.guild!.channels.fetch(channel);
  if (
    channelType instanceof CategoryChannel ||
    channelType instanceof VoiceChannel
  ) {
    await interaction.editReply({
      content: "Can't add a channel of that type.",
    });
  }

  if (command === "register") {
    await prisma.activeChannel.upsert({
      where: {
        id: channel,
      },
      create: {
        id: channel,
        guild: {
          connectOrCreate: {
            where: {
              id: interaction.guild!.id,
            },
            create: {
              id: interaction.guild!.id,
            },
          },
        },
      },
      update: {},
    });
    await interaction.editReply({ content: "Channel registered." });
  } else if (command === "remove") {
    try {
      await prisma.activeChannel.delete({
        where: {
          id: channel,
        },
      });
    } catch (err) {
      sentry.captureException(err); // Maybe don't log this?
      await interaction.editReply({
        content: "Error deleting channel, was the channel registered?",
      });
      return;
    }
    await interaction.editReply({ content: "Channel unregistered." });
  } else if (command == "list") {
    const channels = await prisma.activeChannel.findMany({
      where: {
        guild: {
          id: interaction.guild!.id,
        },
      },
    });
    if (channels.length < 1) {
      await interaction.editReply({ content: "No registered channels" });
      return;
    }
    const channelUrls = channels.map((channel) => `<#${channel.id}>`);
    const response = new EmbedBuilder()
      .setColor(0x00ffff)
      .setTitle("Active Channels")
      .addFields({
        name: " ",
        value: channelUrls.join("\n"),
        inline: false,
      });
    await interaction.editReply({ embeds: [response] });
  } else {
    console.log(
      `ERROR: subcommand not found for /guessing: ${interaction.options.getSubcommand()}`
    );
    await interaction.editReply("An error occured, please try again later.");
  }
};

const category = "utility";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
