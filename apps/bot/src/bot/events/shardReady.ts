import { Snowflake } from "discord.js"
import { EventHandler } from "@internal/lib"
import { logger } from "@internal/logger"

export default class ShardReady extends EventHandler {
	override async run(shardId: number, unavailableGuilds: Set<Snowflake>) {
		logger.info(`Shard ${shardId} online in ${this.client.guilds.cache.size} servers with ${unavailableGuilds?.size || 0} unavailable guilds.`)
	}
}
