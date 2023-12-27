import { BetterClient } from "@buape/lib"
import * as config from "@internal/config"
import { DebugType, logger } from "@internal/logger"

const client = new BetterClient({
	clientOptions: {
		intents: config.intents,
		allowedMentions: { parse: ["users"] }
	},
	supportServer: "https://example.com",
	accessSettings: {
		server: "1105539807444217866",
		roles: {
			gamemaster: [config.serverIds.roles.gamemaster],
			player: [config.serverIds.roles.player],
			spectator: [config.serverIds.roles.spectator]
		}
	}
})

client.login().catch((error) => {
	logger.debug(JSON.stringify(config, null, 2), DebugType.GENERAL)
	logger.thrownError(error)
})

process.on("uncaughtException", (err) => {
	logger.thrownError(err)
})
