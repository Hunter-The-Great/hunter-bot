import { Channel, Client } from "discord.js";
import fs from "node:fs";
import os from "os";

export async function randomizeChannel(client: Client) {
    let channel: Channel | null;
    try {
        channel = await client.channels.fetch("1330609925243535441");
    } catch {
        if (os.hostname() === "BenL-MacBook-Pro.local") return;
        console.log(
            "Failed to initialize channel randomization (no channel found)"
        );
        return;
    }
    if (!channel?.isVoiceBased()) {
        console.log(
            "Failed to initialize channel randomization (invalid channel)."
        );
        return;
    }

    const names = JSON.parse(
        fs.readFileSync("resources/channelNames.json", "utf-8")
    );

    while (true) {
        await channel.setName(names[Math.floor(Math.random() * names.length)]);
        await new Promise((resolve) => setTimeout(resolve, 300000));
    }
}
