import type { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import database from "@internal/database"
import { getPlayerChannel, randomInt } from "@internal/functions"
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
			const fail = randomInt(0, 3) === 0
			if (fail) {
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
					`Your investment of $${investment.amount} has failed!`
				)
				logger.gameLog(
					`Investment failed for ${investment.playerName} with $${investment.amount}`
				)
				continue
			}
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
			logger.gameLog(
				`Investment succeeded for ${investment.playerName} with $${investment.amount * 2}`
			)
		}
	})
}

export { startCron }
