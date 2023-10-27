const { SlashCommandBuilder, TextChannel } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("guessing-game")
    .setDescription("Sends a random message and you have to guess who sent it.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    const channels = (await interaction.guild.channels.fetch()).values();
    let messages = [];
    messages.push(
        ...(await interaction.channel.messages.fetch({ limit: 1 })).values()
    );
    try {
        for (const channel of channels) {
            if (!(channel instanceof TextChannel)) continue;

            if (!messages[0])
                messages.push(
                    ...(await channel.messages.fetch({ limit: 1 })).values()
                );
            if (!messages[0]) continue;

            let lastMessage;
            console.log(channel.name);
            do {
                lastMessage = messages[messages.length - 1];
                const fetchedMessages = await channel.messages.fetch({
                    limit: 100,
                    before: messages[messages.length - 1].id
                        ? messages[messages.length - 1].id
                        : undefined,
                });
                messages.push(...fetchedMessages.values());
                console.log(
                    lastMessage.id + " " + messages[messages.length - 1].id
                );
            } while (lastMessage.id !== messages[messages.length - 1].id);
        }
    } catch (err) {
        console.error(err);
    }
    console.log(messages.length);
};

module.exports = {
    data,
    category: "fun",
    execute,
};
