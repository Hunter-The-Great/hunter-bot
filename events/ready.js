const { Events } = require("discord.js");

const name = Events.ClientReady;

const once = true;

const execute = async (client) => {
    console.log(`Logged in as ${client.user.tag}`);
    var os = require("os");
    try {
        if (os.hostname() === "MacBook-Pro.local") return;
        client.channels.fetch("1126759333733085214").then((channel) => {
            channel.send(
                `# Hunter bot is live on ${
                os.hostname()
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
