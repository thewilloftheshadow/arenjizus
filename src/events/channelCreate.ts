import type { GuildChannel } from "discord.js"
import { serverIds } from "~/config"
import { EventHandler } from "~/lib"
import { logger } from "~/logger"

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
