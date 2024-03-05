const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reloads a command.")
    .setDMPermission(false)
    .setNSFW(false)
    .addStringOption((option) =>
        option
            .setName("command")
            .setDescription("The command to reload.")
            .setRequired(true)
    );

const execute = async (interaction) => {
    console.log("start");
    const commandName = interaction.options
        .getString("command", true)
        .toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
        return interaction.reply(
            `There is no command with name \`${commandName}\`!`
        );
    }

    delete require.cache[
        require.resolve(`../${command.category}/${command.data.name}.ts`)
    ];

    try {
        interaction.client.commands.delete(command.data.name);
        const newCommand = require(`../${command.category}/${command.data.name}.ts`);
        interaction.client.commands.set(newCommand.data.name, newCommand);
        await interaction.reply(
            `Command \`${newCommand.data.name}\` was reloaded!`
        );
    } catch (error) {
        console.error(error);
        await interaction.reply(
            `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``
        );
    }
    console.log("complete");
};

const category = "admin";

export { data, category, execute };
