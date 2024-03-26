import { ModalSubmitInteraction } from "discord.js";
import { prisma } from "../utilities/db";
import { encrypt } from "../utilities/encryption";

const name = "canvas-register";

const execute = async (interaction: ModalSubmitInteraction) => {
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

export { name, execute };
