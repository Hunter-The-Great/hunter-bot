// Run to deploy commands
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";

const commands: SlashCommandBuilder[] = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    if (folder === "admin" || folder === "testing") {
        continue;
    }
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    if (!fs.statSync(commandsPath).isDirectory()) continue;
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

rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
    body: commands,
});
