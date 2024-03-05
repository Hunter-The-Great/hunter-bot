import { SlashCommandBuilder } from "discord.js";

const data = new SlashCommandBuilder()
    .setName("more-waifus")
    .setDescription("Even more waifus")
    .setDMPermission(false)
    .setNSFW(true)
    .addSubcommand((subcommand) =>
        subcommand
            .setName("sfw")
            .setDescription("SFW waifus")
            .addStringOption((option) =>
                option
                    .setName("tag")
                    .setDescription("The tag to search for")
                    .addChoices(
                        { name: "waifu", value: "waifu" },
                        { name: "neko", value: "neko" },
                        { name: "Shinobu", value: "shinobu" },
                        { name: "Megumin", value: "megumin" },
                        { name: "bully", value: "bully" },
                        { name: "cuddle", value: "cuddle" },
                        { name: "hug", value: "hug" },
                        { name: "awoo", value: "awoo" },
                        { name: "kiss", value: "kiss" },
                        { name: "pat", value: "pat" },
                        { name: "smug", value: "smug" },
                        { name: "bonk", value: "bonk" },
                        { name: "yeet", value: "yeet" },
                        { name: "blush", value: "blush" },
                        { name: "smile", value: "smile" },
                        { name: "wave", value: "wave" },
                        { name: "handhold", value: "handhold" },
                        { name: "nom", value: "nom" },
                        { name: "bite", value: "bite" },
                        { name: "slap", value: "slap" },
                        { name: "happy", value: "happy" },
                        { name: "wink", value: "wink" },
                        { name: "poke", value: "poke" },
                        { name: "dance", value: "dance" },
                        { name: "cringe", value: "cringe" }
                    )
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName("nsfw")
            .setDescription("NSFW waifus")
            .addStringOption((option) =>
                option
                    .setName("tag")
                    .setDescription("The tag to search for")
                    .addChoices(
                        { name: "waifu", value: "waifu" },
                        { name: "neko", value: "neko" },
                        { name: "trap", value: "trap" },
                        { name: "blowjob", value: "blowjob" }
                    )
                    .setRequired(true)
            )
    );

const execute = async (interaction) => {
    await interaction.deferReply();

    const response = await fetch(
        `https://api.waifu.pics/${
            interaction.options.getSubcommand() === "sfw" ? "sfw" : "nsfw"
        }/${interaction.options.getString("tag")}`
    );
    if (!response.ok) {
        console.error("Waifu API communication failure.");
        await interaction.editReply(
            "Waifu.pics failed to respond, please try again later."
        );
    }
    const data = await response.json();
    await interaction.editReply(data.url);
};

const category = "testing";

export { data, category, execute };
