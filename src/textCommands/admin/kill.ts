import type { Message } from "discord.js"
import { parseUser } from "~/functions/parseUser"
import { type BetterClient, TextCommand } from "~/lib"

export default class Kill extends TextCommand {
	constructor(client: BetterClient) {
		super("kill", client, {})
	}

	override async run(message: Message, args: string[]) {
		if (
			![
				"960888903764676618",
				"389840562112561183",
				"439223656200273932"
			].includes(message.author.id)
		)
			return
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
