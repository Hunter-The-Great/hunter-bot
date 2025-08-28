// Run to deploy commands
import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { Scopes } from "./utilities/Scopes";
import fs from "node:fs";
import path from "node:path";

const commands: Record<string, SlashCommandBuilder[]> = Object.fromEntries(
    Object.values(Scopes).map((scope) => [scope, []])
);
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
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
        if (
            "data" in command &&
            "execute" in command &&
            "scopes" in command &&
            "category" in command
        ) {
            for (const scope of command.scopes) {
                commands[scope].push(command.data.toJSON());
            }
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data", "execute", "scopes", or "category" property.`
            );
        }
    }
}

const rest = new REST().setToken(process.env.TOKEN!);

for (const scope of Object.keys(commands)) {
    if (commands[scope].length === 0) {
        continue;
    }
    if (scope === "global")
        rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
            body: commands[scope],
        });
    else
        rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, scope),
            {
                body: commands[scope],
            }
        );
}
