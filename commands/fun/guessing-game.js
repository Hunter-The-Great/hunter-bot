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
        include: {
            user: true,
        },
        orderBy: {
            id: "desc",
        },
    });

    let message;
    do {
        message = messages[Math.floor(Math.random() * messages.length)];
    } while (
        message.user.bot ||
        message.content === "" ||
        message.content === null
    );

    let usernames = [];
    usernames.push(message.user.username);
    await interaction.guild.members.fetch({ force: true });
    const blacklist = ["1164630646124195890"];
    const users = interaction.guild.members.cache.filter(
        (member) => !member.user.bot && !blacklist.includes(member.id)
    );
    while (usernames.length < 3 && usernames.length < users.size) {
        const user = users.random().user.username;
        if (usernames.includes(user)) continue;
        usernames.push(user);
    }
    usernames = usernames.sort();
    const row = new ActionRowBuilder().addComponents(
        usernames.map((username) =>
            new ButtonBuilder()
                .setCustomId(`guessing-game:${username}`)
                .setLabel(username)
                .setStyle(ButtonStyle.Primary)
        )
    );
    const userMap = usernames.map((username) => ({
        name: username,
        value: " ",
        inline: true,
    }));
    const response = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(`${message.content}`)
        .addFields(
            usernames.map((username) => ({
                name: username,
                value: " ",
                inline: true,
            }))
        );

    const rsp = await interaction.editReply({
        embeds: [response],
        components: [row],
    });

    try {
        const filter = (i) => i.customId.startsWith("guessing-game");
        const collector = rsp.createMessageComponentCollector({
            filter,
            time: 10_000,
        });
        let guessed = [];
        collector.on("collect", async (i) => {
            if (guessed.includes(i.user.id)) {
                await i.reply({
                    content: "You already guessed!",
                    ephemeral: true,
                });
                return;
            }
            guessed.push(i.user.id);
            const user = userMap.find(
                (user) => user.name === i.customId.split(":")[1]
            );
            if (user.value === " ") {
                user.value = i.user.username;
            } else {
                user.value += `\n${i.user.username}`;
            }
            const response = new EmbedBuilder()
                .setColor(0x00ffff)
                .setTitle(`${message.content}`)
                .addFields(userMap);
            await i.update({ embeds: [response], components: [row] });
        });
        collector.on("end", async () => {
            const row = new ActionRowBuilder().addComponents(
                usernames.map((username) =>
                    new ButtonBuilder()
                        .setCustomId(`guessing-game:${username}`)
                        .setLabel(username)
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(true)
                )
            );
            const user = userMap.find(
                (user) => user.name === message.user.username
            );
            user.name = `*${user.name}*`;
            const response = new EmbedBuilder()
                .setColor(0x00ffff)
                .setTitle(`${message.content}`)
                .setDescription(
                    `Author: <@${message.author}>\nLink: https://discord.com/channels/${interaction.guild.id}/${message.channel}/${message.id}`
                )
                .addFields(userMap);
            interaction.editReply({ embeds: [response], components: [row] });
        });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    data,
    category: "fun",
    execute,
};
