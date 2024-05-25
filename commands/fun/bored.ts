import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("bored")
    .setDescription("Gives you something to do.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.deferReply();

    const response = await fetch("https://www.boredapi.com/api/activity");
    if (!response.ok) {
        console.error("Bored API communication failure.");
        await interaction.editReply(
            "Bored API failed to respond, please try again later."
        );
        return;
    }
    const data = await response.json();
    await interaction.editReply(data.activity + "\n" + data.link);
};

const category = "fun";

export { data, category, execute };
