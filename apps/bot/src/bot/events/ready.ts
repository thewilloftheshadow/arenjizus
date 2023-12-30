import { join } from "path"
import { BetterClient, EventHandler } from "@buape/lib"
import { getFiles } from "@internal/functions"
import { logger } from "@internal/logger"

export default class Ready extends EventHandler {
	override async run() {
		await this.client.application?.fetch()
		const allGuilds = await this.client.shard?.broadcastEval(async (c) =>
			c.guilds.cache.map(
				(guild) => `${guild.name} [${guild.id}] - ${guild.memberCount} members.`
			)
		)
		const guildsStringList: string[] = []
		// @ts-ignore
		for (let i = 0; i < allGuilds.length; i++) {
			// @ts-ignore
			guildsStringList.push(`Shard ${i + 1}\n${allGuilds[i].join("\n")}`)
		}
		// const stats = await this.client.fetchStats()
		logger.info(
			`Logged in as ${this.client.user?.tag} [${this.client.user?.id}]`
		) // with ${stats.guilds} guilds and ${stats.users} users.`)

		loadAndStartCrons(this.client)
	}
}

async function loadAndStartCrons(client: BetterClient) {
	logger.info("[CRON] Starting CRONs...")
	try {
		const jobs = getFiles(join(client.__dirname, "./src/bot/jobs"), "js")

		for await (const job of jobs) {
			logger.info(`[CRON] Starting CRON "${job}"`)
			const { startCron } = await import(
				join(client.__dirname, "./src/bot/jobs", job)
			)
			startCron(client)
			logger.info(`[CRON] Started CRON "${job}"`)
		}
		logger.info(`[CRON] Started ${jobs.length} CRONs.`)
	} catch (_error) {
		logger.warn("[CRON] Failed to load CRONs.")
	}
}
