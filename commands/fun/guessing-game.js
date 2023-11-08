const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
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

    let usernames = [];
    console.log("e");
    const list = await interaction.guild.members;
    const users = list.cache.map((member) => member.user);
    console.log(users);
    while (usernames.length < 4) {
        const user = users[Math.floor(Math.random() * users.length)];
        if (!usernames.includes(user.username)) {
            usernames.push(user.username);
        }
    }
    console.log(usernames);
    const response = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(`${message.content}`);
    interaction.editReply({ embeds: [response], ephemeral: false });
};

module.exports = {
    data,
    category: "fun",
    execute,
};
