import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { prisma } from "../utilities/db";

const name = "feedback";

const execute = async (interaction: ModalSubmitInteraction) => {
    const feedback = interaction.fields.getTextInputValue("input");
    await prisma.feedback.create({
        data: {
            message: feedback,
        },
    });
    await interaction.reply({
        content: "Your feedback has been received, thank you!",
        ephemeral: true,
    });
    const me = await interaction.client.users.fetch("386758028533170177");
    const feedbackAlert = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle("Feedback:")
        .setThumbnail(process.env.AVATAR!)
        .addFields({ name: " ", value: feedback, inline: false })
        .setTimestamp(new Date())
        .setFooter({
            text: "This feedback provided to you by Hunter Bot Enterprises™",
        });
    await me.send({ embeds: [feedbackAlert] });
};

export { name, execute };
