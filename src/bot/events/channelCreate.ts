import { GuildChannel } from "discord.js"
import EventHandler from "../../../lib/classes/EventHandler"

export default class ChannelCreate extends EventHandler {
    override async run(channel: GuildChannel) {
        if (["1061068591342039190", "1058510589686730883"].includes(channel.parentId || "")) {
            await channel.permissionOverwrites.create("1058507292435292250", {
                SEND_MESSAGES: false,
                VIEW_CHANNEL: true,
            }) // spectator
            await channel.permissionOverwrites.create("1061080487017332736", {
                SEND_MESSAGES: false,
            }) // bang
            this.client.logger.gameLog(`<#${channel.id}> was created`)
        }
    }
}
