import { Message } from "discord.js";
import thesaurus from "thesaurus";

const name = "synonyms";

const execute = async (message: Message) => {
  if (!message.reference) {
    return;
  }

  const original = (
    await message.channel.messages.fetch(message.reference.messageId!)
  ).content.split(" ");

  var newMessage = "";
  for (const word of original) {
    const synonyms = thesaurus.find(word);
    if (synonyms.length === 0) {
      newMessage += word + " ";
    } else {
      newMessage += synonyms[Math.floor(Math.random() * synonyms.length)] + " ";
    }
  }
  await message.reply({ content: newMessage });
};

export { name, execute };
