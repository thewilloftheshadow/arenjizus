import type { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import database from "@internal/database"
import { getPlayerChannel } from "@internal/functions"
import { logger } from "@internal/logger"
import Cron from "croner"

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
			await database.investment.delete({
				where: {
					id: investment.id
				}
			})
			const channel = await getPlayerChannel(investment.playerName, client)
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
