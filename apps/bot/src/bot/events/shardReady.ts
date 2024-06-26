import { EventHandler } from "@buape/lib"
import { logger } from "@internal/logger"
import type { Snowflake } from "discord.js"

export default class ShardReady extends EventHandler {
	override async run(shardId: number, unavailableGuilds: Set<Snowflake>) {
		logger.info(
			`Shard ${shardId} online in ${
				this.client.guilds.cache.size
			} servers with ${unavailableGuilds?.size || 0} unavailable guilds.`
		)
	}
}
