import * as config from "~/config"
import { BetterClient } from "~/lib"
import { logger } from "~/logger"
import webServer from "~/web"

const client = new BetterClient({
	clientOptions: {
		intents: config.intents,
		allowedMentions: { parse: ["users"] }
	},
	supportServer: "https://example.com",
	accessSettings: {
		server: config.serverIds.guild,
		roles: {
			gamemaster: [config.serverIds.roles.gamemaster, "1105539807444217875"],
			player: [config.serverIds.roles.player],
			spectator: [config.serverIds.roles.spectator]
		}
	},
	prefix: config.prefix
})

// Start the web server
const server = Bun.serve(webServer)

// Start the Discord bot
client.login(process.env.DISCORD_TOKEN).catch((error) => {
	logger.thrownError(error)
})

process.on("uncaughtException", (err) => {
	logger.thrownError(err)
})

logger.info("Arenjizus has started!")
logger.info(`Web server running on port ${server.port}`)
