import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
} from "discord.js";
import { prisma } from "../../utilities/db.js";
import { decrypt } from "../../utilities/encryption.js";

const data = new SlashCommandBuilder()
    .setName("courses")
    .setDescription("Displays a list of courses.")
    .setDMPermission(true)
    .setNSFW(false);

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

export { data, category, execute };
