import randomstring from "randomstring";
import { prisma } from "../utilities/db";
import { ModalSubmitInteraction } from "discord.js";
import { checkPermissions } from "../utilities/permission-check";
import { trace } from "console";

const name = "gh-register";

const execute = async (interaction: ModalSubmitInteraction) => {
    const discriminator =
        interaction.fields.getTextInputValue("discriminator") ||
        randomstring.generate({ charset: "alphanumeric", length: 25 });
    const channelID = interaction.fields.getTextInputValue("channel") || "-1";
    if (interaction.fields.getTextInputValue("discriminator")) {
        const regex = new RegExp("^[a-zA-Z0-9_-]*$");
        if (!regex.test(discriminator)) {
            await interaction.reply({
                content: "Invalid ID.",
                ephemeral: true,
            });
            return;
        }
    }
    if (interaction.fields.getTextInputValue("channel")) {
        const channel = await interaction.client.channels
            .fetch(channelID)
            .catch(async () => {
                await interaction.reply({
                    content:
                        "An error occurred, check if your channel ID is valid.",
                    ephemeral: true,
                });
                return;
            });
        if (!(await checkPermissions(interaction.user.id, channel))) {
            await interaction.reply({
                content: "You do not have permission to use this channel.",
                ephemeral: true,
            });
            return;
        }
    }

    if (
        await prisma.gitHubWebhook.findFirst({
            where: { uid: interaction.user.id, discriminator },
        })
    ) {
        await interaction.reply({
            content:
                "Endpoint already registered, use a different discriminator.\n(if you got this message with a random discriminator, congratulations, that was a 1 in 6.45*10^44 chance)",
            ephemeral: true,
        });
        return;
    }

    await prisma.gitHubWebhook.create({
        data: { uid: interaction.user.id, discriminator, channelID },
    });
    await interaction.reply({
        content: `Endpoint registered:\nhttps://hunter-bot.lowryb.sbs/gh/${interaction.user.id}/${discriminator}`,
        ephemeral: true,
    });
};

export { name, execute };
