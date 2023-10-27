const { SlashCommandBuilder, EmbedBuilder, hyperlink } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("whois")
    .setDescription("Tells you the information on a given user ID.")
    .setDMPermission(true)
    .setNSFW(false)
    .addUserOption((option) =>
        option
            .setName("target")
            .setDescription("The user to search for.")
            .setRequired(false)
    );

const execute = async (interaction) => {
    const target = interaction.options.getUser("target")
        ? interaction.options.getUser("target")
        : interaction.user;
    const date = new Date(target.createdAt);
    await interaction.deferReply({ ephemeral: true });
    /* 
    * counting messages sent, only gets 100 most recent per channel,
    * needs to repeat for this to work properly, but thats a lot of expensive requests
    
    const channels = (await interaction.guild.channels.fetch()).values();
    let messages = [];
    try {
        for (const channel of channels) {
            if (!(channel instanceof TextChannel)) continue;
            const fetchedMessages = await channel.messages
                .fetch()
                .then((i) => i.filter((m) => m.author.id === target.id));
            messages.push(...fetchedMessages.values());
        }
    } catch (err) {
        console.error(err);
    }
    */

    const info = new EmbedBuilder()
        .setColor(0x00ffff)
        .setTitle(target.username)
        .setThumbnail(target.displayAvatarURL())
        .addFields(
            {
                name: "__**ID**__",
                value: target.id,
                inline: true,
            },

            {
                name: "__**Account Created**__",
                value: date.toUTCString(),
                inline: true,
            },
            {
                name: "__**Avatar**__",
                value: hyperlink("Link", target.displayAvatarURL()),
                inline: true,
            },
            {
                name: "__**Bot?**__",
                value: target.bot ? "Yes" : "No",
                inline: true,
            }
            /*
            {
                name: "__**Messages Sent**__",
                value: `${messages.length}`,
                inline: true,
            }
            */
        );

    await interaction.editReply({ embeds: [info], ephemeral: true });
};

module.exports = {
    data,
    category: "utility",
    execute,
};
