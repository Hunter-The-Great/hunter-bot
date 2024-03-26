import Discord from "discord.js";
declare module "discord.js" {
    export interface FetchMembersOptions {
        force: boolean;
    }
}
