const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} = require("discord.js");
const { prisma } = require("../../utilities/db");

const data = new SlashCommandBuilder()
    .setName("guessing")
    .setDescription("Sends a random message and you have to guess who sent it.")
    .addSubcommand((subcommand) =>
        subcommand.setName("game").setDescription("Starts the game.")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("leaderboard")
            .setDescription("Shows the leaderboard.")
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("stats")
            .setDescription("Shows your stats.")
            .addUserOption((option) =>
                option
                    .setName("target")
                    .setDescription("The user to search for.")
                    .setRequired(false)
            )
    )
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() === "game") {
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
                        content: "You already guessed.",
                        ephemeral: true,
                    });
                    return;
                }
                guessed.push(i.user.id);
                await prisma.user.update({
                    where: { id: i.user.id },
                    data: {
                        guessingAttempts: { increment: 1 },
                        guessingPoints: {
                            increment:
                                i.customId.split(":")[1] ===
                                message.user.username
                                    ? 1
                                    : 0,
                        },
                    },
                });
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
                interaction.editReply({
                    embeds: [response],
                    components: [row],
                });
            });
        } catch (err) {
            console.error(err);
        }
    } else if (interaction.options.getSubcommand() === "stats") {
        const target =
            interaction.options.getUser("target") || interaction.user;
        const user = await prisma.user.findUnique({
            where: { id: target.id },
        });
        const response = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle(`${target.username}'s stats`)
            .addFields(
                {
                    name: "Points",
                    value: `${user.guessingPoints}`,
                    inline: true,
                },
                {
                    name: "Accuracy",
                    value: `${
                        (user.guessingPoints / user.guessingAttempts) * 100
                    }%`,
                    inline: true,
                }
            );
        await interaction.editReply({ embeds: [response] });
    }
};

module.exports = {
    data,
    category: "fun",
    execute,
};
