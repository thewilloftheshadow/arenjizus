import { getFiles } from "~/functions/getFiles"
import { type BetterClient, EventHandler } from "~/lib"
import { logger } from "~/logger"

export default class Ready extends EventHandler {
	override async run() {
		await this.client.application?.fetch()
		const allGuilds = this.client.guilds.cache.map(
			(guild) => `${guild.name} [${guild.id}] - ${guild.memberCount} members.`
		)
		const guildsStringList: string[] = []
		// @ts-ignore
		guildsStringList.push(`${allGuilds.join("\n")}`)
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
		const jobs = getFiles("./jobs", "js")

		for await (const job of jobs) {
			logger.info(`[CRON] Starting CRON "${job}"`)
			const { startCron } = await import(`../jobs/${job}`)
			startCron(client)
			logger.info(`[CRON] Started CRON "${job}"`)
		}
		logger.info(`[CRON] Started ${jobs.length} CRONs.`)
	} catch (_error) {
		logger.warn("[CRON] Failed to load CRONs.")
	}
}
