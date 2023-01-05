import { GuildChannel } from "discord.js"
import EventHandler from "../../../lib/classes/EventHandler"

export default class ChannelCreate extends EventHandler {
    override async run(channel: GuildChannel) {
        if (channel.parentId === "1058510589686730883") {
            await channel.permissionOverwrites.create("1058507292435292250", {
                SEND_MESSAGES: false,
                VIEW_CHANNEL: true,
            })
            this.client.logger.gameLog(`<#${channel.id}> was created`)
        }
    }
}
