import { Client, Events } from "discord.js";
import os from "os";
import { sentry } from "../utilities/sentry";

const name = Events.ClientReady;

const once = true;

const execute = async (client: Client) => {
    console.log(`Logged in as ${client.user!.tag}`);
    try {
        if (os.hostname() === "BenL-MacBook-Pro.local") return;
        client.channels.fetch("1126759333733085214").then((channel) => {
            if (!channel || !channel.isTextBased() || channel.isDMBased())
                return;
            channel.send(
                `# Hunter bot is live on ${os.hostname()}.\n \`${new Date().toLocaleString()}\``
            );
        });
    } catch (err) {
        console.log(err);
        sentry.captureException(err);
    }
};
export { name, once, execute };
