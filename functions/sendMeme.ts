import { Client, GuildChannel } from "discord.js";
import { embedify, backup } from "./embedify";

export async function sendMeme(
  client: Client,
  user: string,
  link: string
): Promise<void> {
  const channel = await client.channels.fetch(process.env.MEME_CHANNEL!);

  if (!(channel instanceof GuildChannel) || !channel.isTextBased()) {
    return;
  }

  if (link.includes("sora.chatgpt.com")) {
    await channel.send(
      `Whoops! ${user} tried to send AI slop! We don't support that here. Please reevaluate your life choices.`
    );
    throw new Error("Error processing link.");
  }

  const info = await embedify(link);

  if (info === null) {
    throw new Error("Error processing link.");
  }

  const { url, filename } = info;

  if (filename === null) {
    try {
      await channel.send(`-# [Sent by: ${user}](${url})`);
      return;
    } catch {
      throw new Error("Error processing link.");
    }
  }

  try {
    await channel.send({
      files: [
        {
          attachment: url,
          name: filename,
        },
      ],
      content: `-# [Sent by: ${user}](<${link}>)`,
    });
  } catch (err) {
    try {
      await channel.send(`-# [Sent by: ${user}](${backup(link)})`);
    } catch (err) {
      throw new Error("Error processing link.");
    }
  }
  return;
}
