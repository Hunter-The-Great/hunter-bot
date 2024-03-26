import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder().setName("test").setDescription("test");

const execute = async (interaction) => {
    // this weighs all channels equally which makes this selection really bad
    // const channel = (await interaction.guild.channels.fetch()).random();
    const start = interaction.channel.createdTimestamp;
    const today = new Date().getTime();
    const randDate = new Date(start + Math.random() * (today - start));
    const snowflake = (
        (BigInt(randDate.valueOf()) - BigInt(1420070400000)) <<
        BigInt(22)
    ).toString();
    const message = (
        await interaction.channel.messages.fetch({
            limit: 50,
            before: snowflake,
        })
    ).random();
    await interaction.reply({ content: message.content });
};

const category = "testing";

export { data, category, execute };
