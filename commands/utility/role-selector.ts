import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    InteractionContextType,
    ApplicationIntegrationType,
    PermissionsBitField,
    MessageActionRowComponentBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
} from "discord.js";
import { Scopes } from "../../utilities/Scopes";

const data = new SlashCommandBuilder()
    .setName("role-selector")
    .setDescription("Create a role selector message.")
    .setNSFW(false)
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .setContexts([
        InteractionContextType.BotDM,
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
    ])
    .setIntegrationTypes([
        ApplicationIntegrationType.UserInstall,
        ApplicationIntegrationType.GuildInstall,
    ]);

const execute = async (interaction: ChatInputCommandInteraction) => {
    if (!interaction.guild) {
        await interaction.reply({
            content: "This command is only available in servers.",
            ephemeral: true,
        });
        return;
    }
    const availableRoles = interaction.guild.roles.cache.filter(
        (role) => role.editable && role.name !== "@everyone"
    );

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId("role-selector-setup")
        .setPlaceholder("Select roles to include in the dropdown.")
        .setMinValues(1)
        .setMaxValues(availableRoles.size)
        .addOptions(
            availableRoles.map((role) => ({
                label: role.name,
                value: role.id,
            }))
        );

    const row =
        new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(
            selectMenu
        );

    const rsp = await interaction.reply({
        content: "Select the roles to include in the role selector:",
        components: [row],
        ephemeral: true,
    });
    const collector = rsp.createMessageComponentCollector({
        time: 30_000,
        filter: (i) =>
            i.customId === "role-selector-setup" &&
            i.user.id === interaction.user.id,
    });

    collector.on(
        "collect",
        async (selectInteraction: StringSelectMenuInteraction) => {
            const selectedRoles = selectInteraction.values;

            const rows: ActionRowBuilder<ButtonBuilder>[] = [];
            let currentRow = new ActionRowBuilder<ButtonBuilder>();

            // NOTE: I'm not sure if there's a limit to how many rows can be added

            selectedRoles.forEach((role) => {
                const name = availableRoles.get(role)?.name;
                if (name) {
                    const name = availableRoles.get(role)!.name;
                    const button = new ButtonBuilder()
                        .setCustomId(`role-select:${role}:${name}`)
                        .setLabel(name)
                        .setStyle(ButtonStyle.Primary);

                    currentRow.addComponents(button);
                }

                if (currentRow.components.length === 5) {
                    rows.push(currentRow);
                    currentRow = new ActionRowBuilder<ButtonBuilder>();
                }
            });
            if (currentRow.components.length !== 0) rows.push(currentRow);
            rows.push(
                new ActionRowBuilder<ButtonBuilder>().addComponents(
                    new ButtonBuilder()
                        .setCustomId("role-check")
                        .setLabel("Check Roles")
                        .setStyle(ButtonStyle.Secondary)
                )
            );

            if (!selectInteraction.channel?.isSendable()) return;
            await selectInteraction.channel.send({
                content: "Select your roles to toggle:",
                components: rows,
            });

            await interaction.deleteReply();

            collector.stop();
        }
    );

    collector.on("end", async (collected) => {
        if (collected.size === 0) {
            await interaction.followUp({
                content: "Role selection timed out. Please try again.",
                ephemeral: true,
            });
        }
    });
};

const category = "utility";
const scopes = [Scopes.global];

export { data, category, scopes, execute };
