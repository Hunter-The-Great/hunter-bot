import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("id")
    .setDescription("Tells you your user ID.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction: ChatInputCommandInteraction) => {
    await interaction.reply({
        content: "Your user ID is: " + interaction.user.id,
        ephemeral: true,
    });
};

const category = "utility";

export { data, category, execute };
