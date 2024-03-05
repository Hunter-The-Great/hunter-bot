import { prisma } from "../utilities/db";
import { PermissionsBitField } from "discord.js";

const name = "gh-edit";

const execute = async (interaction) => {
    const discriminator = interaction.fields.getTextInputValue("discriminator");
    const channelID = interaction.fields.getTextInputValue("channel") || "0";

    if (interaction.fields.getTextInputValue("channel")) {
        const channel = await interaction.client.channels
            .fetch(channelID)
            .catch(() => {
                interaction.reply({
                    content: "Invalid channel ID.",
                    ephemeral: true,
                });
                return;
            });

        const member = await channel.guild.members.fetch({
            force: true,
            user: interaction.user.id,
        });
        if (
            !(
                member.permissions.has(
                    PermissionsBitField.Flags.Administrator
                ) || interaction.user.id === channel.guild.ownerId
            )
        ) {
            await interaction.reply({
                content: "You do not have admin permissions in this server.",
                ephemeral: true,
            });
            return;
        }
        await prisma.GitHubWebhook.updateMany({
            where: {
                uid: interaction.user.id,
                discriminator: interaction.fields.getTextInputValue("endpoint"),
            },
            data: { channelID },
        });
    }

    if (interaction.fields.getTextInputValue("discriminator")) {
        if (
            !prisma.GitHubWebhook.findFirst({
                where: { uid: interaction.user.id, discriminator },
            })
        ) {
            await interaction.reply({
                content: "Endpoint not registered.",
                ephemeral: true,
            });
            return;
        }
        const regex = new RegExp("^[a-zA-Z0-9_-]*$");
        if (!regex.test(discriminator)) {
            await interaction.reply({
                content: "Invalid ID.",
                ephemeral: true,
            });
            return;
        }
        if (
            await prisma.GitHubWebhook.findFirst({
                where: { uid: interaction.user.id, discriminator },
            })
        ) {
            await interaction.reply({
                content:
                    "Endpoint already registered, use a different discriminator.",
                ephemeral: true,
            });
            return;
        }
        await prisma.GitHubWebhook.updateMany({
            where: {
                uid: interaction.user.id,
                discriminator: interaction.fields.getTextInputValue("endpoint"),
            },
            data: { discriminator },
        });
    }

    await interaction.reply({
        content: `Endpoint edited:\nhttps://hunter-bot.drewh.net/gh/${interaction.user.id}/${discriminator}`,
        ephemeral: true,
    });
};

export { name, execute };
