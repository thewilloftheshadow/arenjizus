import { EventHandler } from "~/lib"
import { logger } from "~/logger"

export default class Warn extends EventHandler {
	override async run(msg: string) {
		logger.warn(`${msg}`)
	}
}
