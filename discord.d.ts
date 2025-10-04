import Discord from "discord.js";
declare module "discord.js" {
  export interface FetchMembersOptions {
    force: boolean;
  }
  export interface Client {
    commands: Collection<string, any> = new Collection();
    textCommands: Collection<string, any> = new Collection();
    modals: Collection<string, any> = new Collection();
    buttons: Collection<string, any> = new Collection();
  }
}
