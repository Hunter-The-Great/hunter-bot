import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
  InteractionContextType,
  ApplicationIntegrationType,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";
import { prisma } from "../../utilities/db.js";
import { decrypt } from "../../utilities/encryption.js";

const data = new SlashCommandBuilder()
  .setName("courses")
  .setDescription("Displays a list of courses.")
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
  const user = await prisma.user.findUnique({
    where: { id: interaction.user.id },
  });
  const rawToken = user?.canvasToken;
  const token = await decrypt(rawToken);
  const response = await fetch(
    "https://canvas.instructure.com/api/v1/courses?enrollment_state=active",
    {
      headers: { Authorization: "Bearer " + token },
    }
  );
  if (!response.ok) {
    await interaction.reply({
      content:
        "Error communicating with Canvas. Make sure your token is valid.",
      ephemeral: true,
    });
    return;
  }
  const courses = await response.json();
  const courseList = courses.map((course) => course.name).join("\n");
  const embed = new EmbedBuilder()
    .setColor(0x00ffff)
    .setTitle("Courses")
    .setThumbnail(process.env.AVATAR || null)
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL(),
    })
    .setDescription(courseList);
  await interaction.reply({ embeds: [embed] });
};

const category = "canvas";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
