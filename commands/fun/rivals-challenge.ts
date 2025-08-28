import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
    EmbedBuilder,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";

const data = new SlashCommandBuilder()
    .setName("rivals-challenge")
    .setDescription(
        "Gives you a random challenge to do for a Marvel Rivals match."
    )
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
    .addNumberOption((option) =>
        option
            .setName("players")
            .setDescription("The number of players.")
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(6)
    );

const execute = async (interaction: ChatInputCommandInteraction) => {
    const teamChallenges = [
        "Play your least played characters",
        "Must use ultimates immediately when you get them.",
        "Must RP your character.",
        "Must swap to next character in list when you die.",
        "Invert mouse movement.",
        "No hud (and no melee characters).",
    ];
    const individualChallenges = {
        "Black Widow": ["No ADS."],
        "Black Panther": [
            "Every time you miss a dash reset you have to make a move in chess.",
        ],
        Spiderman: [
            "Must touch enemy spawn door after spawn before you can do anything else.",
            "No web swinging.",
        ],
        Hawkeye: ["Abilites only", "Blast arrows only."],
        Punisher: ["No final hits."],
        "Moon Knight": ["Can only shoot ankhs."],
        "Cloak and Dagger": ["Cloak only."],
        Hulk: ["Bruce Banner only."],
        "Squirrel Girl": ["Can only shoot with eyes closed."],
        Blade: ["Blade only."],
        "Dr. Strange": ["No purging darkness."],
        "Emma Frost": ["No shooting when beam is at 100% charge."],
        "Rocket Racoon": ["No healing."],
        Venom: [
            "Must use twerk emote after every kill and before you're allowed to disengage a dive.",
        ],
        Groot: ["No walls."],
        Starlord: ["No walking."],
    };

    const players =
        interaction.options.getNumber("players") ??
        (interaction.guild?.id === "1120455139954786324" ? 3 : 6);

    let team = true;
    if (Math.random() < 0.3) {
        // Team challenges
        const challenge =
            teamChallenges[Math.floor(Math.random() * teamChallenges.length)];

        const embed: EmbedBuilder = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle("Team Challenge")
            .setDescription(challenge.toString());

        await interaction.reply({ embeds: [embed] });
    } else {
        // Individual challenges
        team = false;
        const challenges: string[] = [];

        for (let i = 0; i < players; i++) {
            const character =
                Object.keys(individualChallenges)[
                    Math.floor(
                        Math.random() *
                            Object.entries(individualChallenges).length
                    )
                ];

            challenges.push(
                `- Player ${i + 1}: ${character} – ${
                    individualChallenges[character][
                        Math.floor(
                            Math.random() *
                                individualChallenges[character].length
                        )
                    ]
                } `
            );

            delete individualChallenges[character];
        }

        if (
            interaction.guild?.id === "1120455139954786324" &&
            players === 3 &&
            !team
        ) {
            challenges[0] = "- Ben" + challenges[0].substring(10);
            challenges[1] = "- Cohen" + challenges[1].substring(10);
            challenges[2] = "- Drew" + challenges[2].substring(10);
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle("Individual Challenges")
            .setDescription(
                "-# Player number goes in Discord VC order, top to bottom"
            )
            .addFields({
                name: "",
                value: challenges.join("\n"),
            });

        await interaction.reply({ embeds: [embed] });
    }
};

const category = "fun";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
