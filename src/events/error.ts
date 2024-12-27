import { EventHandler } from "~/lib"
import { logger } from "~/logger"

export default class Err extends EventHandler {
	override async run(error: Error) {
		logger.thrownError(error)
	}
}
