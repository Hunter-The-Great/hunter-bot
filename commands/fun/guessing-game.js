const { SlashCommandBuilder } = require("discord.js");
const { prisma } = require("../../utilities/db");

const data = new SlashCommandBuilder()
    .setName("guessing-game")
    .setDescription("Sends a random message and you have to guess who sent it.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();
    const messages = await prisma.message.findMany({
        where: {
            guildID: interaction.guild.id,
        },
        orderBy: {
            id: "desc",
        },
    });

    let message;
    do {
        message = messages[Math.floor(Math.random() * messages.length)];
    } while (
        (await prisma.user.findUnique({ where: { id: message.author } })).bot ||
        message.content === "" ||
        message.content === null
    );
    interaction.editReply({ content: message.content, ephemeral: false });
};

module.exports = {
    data,
    category: "fun",
    execute,
};
