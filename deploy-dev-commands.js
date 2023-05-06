// Run to deploy commands

require("dotenv/config");

const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
// Grab all the command files from the commands directory you created earlier
const foldersPath = path.join(__dirname, "commands");
const commandFolders = ["admin", "testing"];

for (const folder of commandFolders) {
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
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

const rest = new REST().setToken(process.env.TOKEN);

console.log(
    "Sending " +
        commands.length +
        " command" +
        (commands.length > 1 ? "s: " : ": ")
);
for (const command of commands) {
    console.log(command);
}

rest.put(
    Routes.applicationGuildCommands(process.env.clientId, process.env.guildID),
    { body: commands }
);
