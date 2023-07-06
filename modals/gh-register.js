var randomstring = require("randomstring");
const { prisma } = require("../../utilities/db");

const execute = async (interaction) => {
    const discriminator =
        interaction.fields.getTextInputValue("discriminator") ||
        randomstring.generate({ charset: "alphanumeric", length: 25 });
    const channelID = interaction.fields.getTextInputValue("channel") || null;

    if (
        await prisma.githubwebhook.findFirst({
            where: { uid: interaction.user.id, discriminator },
        })
    ) {
        await interaction.reply({
            content: "Endpoint already registered.",
            ephemeral: true,
        });
        return;
    }

    await prisma.githubwebhook.create({
        data: { uid: interaction.user.id, discriminator, channelID },
    });
    await interaction.reply({
        content: `Endpoint registered:\nhttps://hunter-bot-production.up.railway.app/gh/${interaction.user.id}/${discriminator}`,
        ephemeral: true,
    });
};

module.exports = {
    name: "gh-register",
    execute,
};
