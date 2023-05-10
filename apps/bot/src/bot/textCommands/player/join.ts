import { serverIds } from "@internal/config"
import { TextCommand, BetterClient } from "@internal/lib"
import { Message } from "discord.js"

export default class Cmd extends TextCommand {
	constructor(client: BetterClient) {
		super("hippotime", client, {})
	}

	override async run(message: Message) {
		await message.delete()
		message.member?.roles.add(serverIds.roles.player)
	}
}
