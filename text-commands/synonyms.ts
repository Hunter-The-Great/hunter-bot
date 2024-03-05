const name = "synonyms";
const thesaurus = require("thesaurus");

const execute = async (message) => {
    if (!message.reference) {
        return;
    }

    const original = (
        await message.channel.messages.fetch(message.reference.messageId)
    ).content.split(" ");

    var newMessage = "";
    for (const word of original) {
        const synonyms = thesaurus.find(word);
        if (synonyms.length === 0) {
            newMessage += word + " ";
        } else {
            newMessage +=
                synonyms[Math.floor(Math.random() * synonyms.length)] + " ";
        }
    }
    await message.reply({ content: newMessage });
};

module.exports = {
    name,
    execute,
};
