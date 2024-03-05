import { PermissionsBitField } from "discord.js";

const checkPermissions = async (uid, channel) => {
    const member = await channel.guild.members.fetch({
        force: true,
        user: uid,
    });

    return (
        member.permissions.has(PermissionsBitField.Flags.Administrator) ||
        member === channel.guild.ownerId
    );
};

export { checkPermissions };
