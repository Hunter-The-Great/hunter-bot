const { Events } = require("discord.js");

const name = Events.ClientReady;

const once = true;

const execute = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    try {
        client.channels.fetch(process.env.UPDATE_CHANNEL).then((channel) => {
            channel.send(
                `# Hunter bot is live on ${
                    process.env.LOCAL ? "local" : "portainer"
                }.\n \`${new Date().toLocaleString()}\``
            );
        });
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    name,
    once,
    execute,
};
