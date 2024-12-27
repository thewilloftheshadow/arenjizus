import { type BetterClient, TextCommand } from "~/lib"
import { parseUser } from "~/functions/parseUser"
import type { Message } from "discord.js"

export default class Kill extends TextCommand {
	constructor(client: BetterClient) {
		super("kill", client, {
			restriction: "gamemaster"
		})
	}

	override async run(message: Message, args: string[]) {
		if (!message.channel.isSendable()) return
		if (args[0]) {
			const user = await parseUser(args[0], this.client)
			if (!user) return message.channel.send("Invalid user")

			message.reply({ content: "<a:abearstab:1191103361118916698> 👻" })
		} else {
			message.reply("You need to specify a user!")
		}
	}
}
