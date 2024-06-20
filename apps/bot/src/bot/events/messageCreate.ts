import { EventHandler } from "@buape/lib"
import type { Message } from "discord.js"

export default class MessageCreate extends EventHandler {
	override async run(message: Message) {
		this.client.textCommandHandler.handle(message)
	}
}
