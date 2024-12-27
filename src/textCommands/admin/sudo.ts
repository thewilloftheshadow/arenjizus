import { type BetterClient, TextCommand } from "~/lib"
import { parseUser } from "~/functions/parseUser"
import type { Message } from "discord.js"

export default class Sudo extends TextCommand {
	constructor(client: BetterClient) {
		super("sudo", client, {})
	}

	override async run(message: Message, args: string[]) {
		if (!message.channel.isSendable()) return
		if (args[0]) {
			const user = await parseUser(args[0], this.client)
			if (!user) return message.channel.send("Invalid user")

			this.client.sudo.set(message.author.id, user.id)

			message.reply(`Sudoing ${user.tag}`)
		} else {
			this.client.sudo.delete(message.author.id)
			message.reply("Stopped sudo")
		}
	}
}
