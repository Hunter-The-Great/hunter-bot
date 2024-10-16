// Run to deploy commands
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const commands: SlashCommandBuilder[] = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = ["admin"];

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN!);
rest.put(
    Routes.applicationGuildCommands(
        process.env.CLIENT_ID!,
        "733531124655063051"
    ),
    { body: commands }
);
