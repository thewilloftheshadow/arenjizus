import { EventHandler } from "@buape/lib"
import { serverIds } from "@internal/config"
import { logger } from "@internal/logger"
import { GuildChannel } from "discord.js"

export default class ChannelCreate extends EventHandler {
	override async run(channel: GuildChannel) {
		if (serverIds.inGameCategories.includes(channel.parentId || "")) {
			await channel.permissionOverwrites.create(serverIds.roles.spectator, {
				SendMessages: false,
				ViewChannel: true
			}) // spectator
			logger.gameLog(`<#${channel.id}> was created`)
		}
	}
}
