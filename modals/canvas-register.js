const { prisma } = require("../utilities/db");
const { encrypt } = require("../utilities/encryption");

const execute = async (interaction) => {
    const token = interaction.fields.getTextInputValue("token");

    const encrypted = await encrypt(token);

    await prisma.user.update({
        where: { id: interaction.user.id },
        data: { canvasToken: Buffer.from(encrypted) },
    });

    await interaction.reply({
        content: "Token registered.",
        ephemeral: true,
    });
};

module.exports = {
    name: "canvas-register",
    execute,
};
