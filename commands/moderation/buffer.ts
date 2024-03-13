import { SlashCommandBuilder } from "discord.js";
import fs from "fs";

const data = new SlashCommandBuilder()
    .setName("buffer")
    .setDescription("Sends a buffer of empty space.")
    .setDMPermission(false)
    .setNSFW(false);

const execute = async (interaction) => {
    const data = fs.readFileSync("resources/buffer.txt", "utf8");
    await interaction.reply(data);
};

const category = "moderation";

export { data, category, execute };