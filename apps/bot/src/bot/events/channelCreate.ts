import { serverIds } from "@internal/config"
import { EventHandler } from "@internal/lib"
import { logger } from "@internal/logger"
import { GuildChannel } from "discord.js"

export default class ChannelCreate extends EventHandler {
	override async run(channel: GuildChannel) {
		if (serverIds.inGameCategories.includes(channel.parentId || "")) {
			await channel.permissionOverwrites.create(serverIds.roles.spectator, {
				SendMessages: false,
				ViewChannel: true,
			}) // spectator
			logger.gameLog(`<#${channel.id}> was created`)
		}
	}
}
