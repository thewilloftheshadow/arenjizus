import type { Message } from "discord.js"
import { parseUser } from "~/functions/parseUser"
import { type BetterClient, TextCommand } from "~/lib"

export default class Kill extends TextCommand {
	constructor(client: BetterClient) {
		super("awaken", client, {
			restriction: "gamemaster"
		})
	}

	override async run(message: Message, args: string[]) {
		if (!message.channel.isSendable()) return
		if (args[0]) {
			const user = await parseUser(args[0], this.client)
			if (!user) return message.channel.send("Invalid user")
			if (args[1]) {
				const count = Number.parseInt(args[1])
				if (!count || count < 1)
					return message.reply("You need to specify a number greater than 0!")
				if (count > 50)
					return message.reply("You can't awaken more than 50 times!")
				for (let i = 0; i < count; i++) {
					await message.channel.send({
						content: `<@${user.id}>`,
						allowedMentions: { users: [user.id] }
					})
				}
			} else {
				message.reply({ content: "Brotha what?" })
			}
		} else {
			message.reply("You need to specify a user!")
		}
	}
}
