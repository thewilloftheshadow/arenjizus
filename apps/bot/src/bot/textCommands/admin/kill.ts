import { type BetterClient, TextCommand } from "@buape/lib"
import { parseUser } from "@internal/functions"
import type { Message } from "discord.js"

export default class Kill extends TextCommand {
	constructor(client: BetterClient) {
		super("kill", client, {})
	}

	override async run(message: Message, args: string[]) {
		if (args[0]) {
			const user = await parseUser(args[0], this.client)
			if (!user) return message.channel.send("Invalid user")

			message.reply({ content: "<a:abearstab:1191103361118916698> 👻" })
		} else {
			message.reply("You need to specify a user!")
		}
	}
}
