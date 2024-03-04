const { Client, GatewayIntentBits, Collection } = require("discord.js");
require("dotenv/config");
const { start } = require("./rest-server.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

const fs = require("node:fs");
const path = require("node:path");

// reading in all commands from the commands folder
client.commands = new Collection();
let foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

//Registers commands
for (const folder of commandFolders) {
    if (!fs.lstatSync(path.join(foldersPath, folder)).isDirectory()) {
        continue;
    }
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Registers text commands
client.textCommands = new Collection();
const textPath = path.join(__dirname, "text-commands");
const textFiles = fs
    .readdirSync(textPath)
    .filter((file) => file.endsWith(".js"));
for (const file of textFiles) {
    const filePath = path.join(textPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("name" in command && "execute" in command) {
        client.textCommands.set(command.name, command);
    } else {
        console.log(
            `[WARNING] The text command at ${filePath} is missing a required "name" or "execute" property.`
        );
    }
}

//registers modals
client.modals = new Collection();
const modalsPath = path.join(__dirname, "modals");
const modalFiles = fs
    .readdirSync(modalsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of modalFiles) {
    const filePath = path.join(modalsPath, file);
    const modal = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("name" in modal && "execute" in modal) {
        client.modals.set(modal.name, modal);
    } else {
        console.log(
            `[WARNING] The modal at ${filePath} is missing a required "name" or "execute" property.`
        );
    }
}

// Registers events
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.TOKEN);

start(client);
