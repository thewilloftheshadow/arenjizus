import { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import database from "@internal/database"
import { logger } from "@internal/logger"
import Cron from "croner"
import { ChannelType, GuildTextBasedChannel } from "discord.js"

const startCron = (client: BetterClient) => {
	Cron("* * * * *", async () => {
		// Every minute
		const investments = await database.investment.findMany({
			where: {
				expiresAt: {
					lte: new Date()
				}
			}
		})
		const guild = await client.guilds.fetch(serverIds.guild)
		if (!guild) return
		await guild.channels.fetch()
		for await (const investment of investments) {
			await database.player.update({
				where: {
					name: investment.playerName
				},
				data: {
					money: {
						increment: investment.amount * 2
					}
				}
			})
			const channel = guild.channels.cache.find(
				(c) =>
					c.name === `gm-${investment.playerName.toLowerCase()}` &&
					c.type === ChannelType.GuildText
			) as GuildTextBasedChannel
			if (!channel) {
				logger.error(`Could not find channel for ${investment.playerName}`)
				continue
			}
			await channel.send(
				`You have received $${investment.amount * 2} from your investment!`
			)
		}
	})
}

export { startCron }
