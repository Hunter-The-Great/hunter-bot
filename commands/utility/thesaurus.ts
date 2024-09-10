import {
    SlashCommandBuilder,
    EmbedBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
} from "discord.js";

const data = new SlashCommandBuilder()
    .setName("thesaurus")
    .setDescription("Gives a list of synonyms for a word.")
    .setNSFW(false)
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ])

    .addStringOption((option) =>
        option
            .setName("word")
            .setDescription("The word to search for.")
            .setRequired(true)
    );
const execute = async (interaction: ChatInputCommandInteraction) => {
    const thesaurus = require("thesaurus");

    const synonyms = thesaurus.find(interaction.options.getString("word"));

    if (synonyms.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle(
                `No synonyms found for "${interaction.options.getString(
                    "word"
                )}"`
            )
            .setColor(0x00ffff);
        await interaction.reply({ embeds: [embed], ephemeral: false });
        return;
    }
    const syn1 =
        synonyms.length > 10
            ? synonyms.slice(0, synonyms.length / 4)
            : synonyms;
    const syn2 =
        synonyms.length > 10
            ? synonyms.slice(synonyms.length / 4, synonyms.length / 2)
            : [];
    const syn3 =
        synonyms.length > 10
            ? synonyms.slice(synonyms.length / 2, (synonyms.length / 4) * 3)
            : [];
    const syn4 =
        synonyms.length > 10
            ? synonyms.slice((synonyms.length / 4) * 3, synonyms.length)
            : [];

    const list1 = `• ${syn1.join("\n• ")}`;
    const list2 = `• ${syn2.join("\n• ")}`;
    const list3 = `• ${syn3.join("\n• ")}`;
    const list4 = `• ${syn4.join("\n• ")}`;

    const embed = new EmbedBuilder()
        .setTitle(`Synonyms for "${interaction.options.getString("word")}"`)
        .setColor(0x00ffff)
        .addFields({
            name: " ",
            value: list1,
            inline: true,
        })
        .addFields({
            name: " ",
            value: " ",
            inline: true,
        })
        .addFields({
            name: " ",
            value: list2.length > 3 ? list2 : " ",
            inline: true,
        })
        .addFields({
            name: " ",
            value: list3.length > 3 ? list3 : " ",
            inline: true,
        })
        .addFields({
            name: " ",
            value: " ",
            inline: true,
        })
        .addFields({
            name: " ",
            value: list4.length > 3 ? list4 : " ",
            inline: true,
        });

    await interaction.reply({
        embeds: [embed],
        ephemeral: false,
    });
};

const category = "utility";

export { data, category, execute };
