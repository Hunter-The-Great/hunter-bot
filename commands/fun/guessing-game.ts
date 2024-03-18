import {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
} from "discord.js";
import { prisma } from "../../utilities/db";

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
    const numMessages = await prisma.message.count({
        where: {
            guildID: interaction.guild.id,
            NOT: {
                content: "",
            },
            user: {
                bot: false,
            },
        },
    });
    const skip = Math.floor(Math.random() * (numMessages - 1));
    if (interaction.options.getSubcommand() === "game") {
        const message = (
            await prisma.message.findMany({
                take: 1,
                skip: skip,
                where: {
                    guildID: interaction.guild.id,
                    NOT: {
                        content: "",
                    },
                    user: {
                        bot: false,
                    },
                },
                include: {
                    user: true,
                },
            })
        )[0];

        let usernames: string[] = [];
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
            let guessed: string[] = [];
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
                if (user?.value === " ") {
                    user.value = i.user.username;
                } else if (user) {
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
                for (const user of userMap) {
                    if (user.name === message.user.username) {
                        user.name = `:white_check_mark:${user.name}:white_check_mark:`;
                        continue;
                    }
                    user.name = `:x:${user.name}:x:`;
                }
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
        if (!user) {
            await interaction.editReply("User not found.");
            return;
        }
        const response = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle(`${target.username}'s stats`)
            .addFields(
                {
                    name: "Points",
                    value: `${user?.guessingPoints}`,
                    inline: true,
                },
                {
                    name: "Accuracy",
                    value: `${Number(
                        (
                            (user.guessingPoints / user.guessingAttempts) *
                            100
                        ).toFixed(2)
                    )}%`,
                    inline: true,
                }
            );
        await interaction.editReply({ embeds: [response] });
    } else if (interaction.options.getSubcommand() === "leaderboard") {
        const guildMembers = (
            await interaction.guild.members.fetch({
                force: true,
            })
        ).filter((member) => !member.user.bot);
        const users = (
            await prisma.user.findMany({
                where: {
                    id: {
                        in: guildMembers.map((member) => member.id),
                    },
                },
                orderBy: {
                    guessingPoints: "desc",
                },
                take: 10,
            })
        ).filter((user) => user.guessingPoints > 0);
        const response = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle(`Leaderboard for ${interaction.guild.name}`)
            .addFields(
                users.map((user, index) => ({
                    name: `${index + 1}. ${user.username}`,
                    value: `${user.guessingPoints} points (${Number(
                        (
                            (user.guessingPoints / user.guessingAttempts) *
                            100
                        ).toFixed(2)
                    )}% accuracy)`,
                    inline: false,
                }))
            );
        await interaction.editReply({ embeds: [response] });
    } else {
        console.log(
            `ERROR: subcommand not found for /guessing: ${interaction.options.getSubcommand()}`
        );
        await interaction.editReply(
            "An error occured, please try again later."
        );
    }
};

const category = "fun";

export { data, category, execute };
