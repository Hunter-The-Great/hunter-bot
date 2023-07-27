var randomstring = require("randomstring");
const { prisma } = require("../utilities/db");
const { PermissionsBitField } = require("discord.js");

const execute = async (interaction) => {
    const discriminator =
        interaction.fields.getTextInputValue("discriminator") ||
        randomstring.generate({ charset: "alphanumeric", length: 25 });
    const channelID = interaction.fields.getTextInputValue("channel") || "0";
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
        const channel = await interaction.client.channels.fetch(channelID);
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
    }

    if (
        await prisma.GitHubWebhook.findFirst({
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

    await prisma.GitHubWebhook.create({
        data: { uid: interaction.user.id, discriminator, channelID },
    });
    await interaction.reply({
        content: `Endpoint registered:\nhttps://hunter-bot.drewh.net/gh/${interaction.user.id}/${discriminator}`,
        ephemeral: true,
    });
};

module.exports = {
    name: "gh-register",
    execute,
};
