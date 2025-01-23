import { Message } from "discord.js";
import { backup, embedify } from "../functions/embedify";

const name = "mp4";

const execute = async (message: Message) => {
    if (!message.reference || !message.channel.isSendable()) return;

    const repliedMessage = await message.channel.messages.fetch(
        message.reference.messageId!
    );

    const link = repliedMessage.content;

    try {
        new URL(link);
    } catch {
        return;
    }

    const info = await embedify(link);
    if (info === null) return;
    const { url, filename } = info;

    if (filename === null) await repliedMessage.reply(`[.](${url})`);
    else {
        try {
            await repliedMessage.reply({
                files: [
                    {
                        attachment: url,
                        name: filename,
                    },
                ],
            });
        } catch {
            await message.channel.send(backup(link));
        }
    }
    await message.delete();
};

export { name, execute };
