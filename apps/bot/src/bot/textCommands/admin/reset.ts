import database, { Death } from "@internal/database"
import { TextCommand, BetterClient } from "@internal/lib"
import { Message, TextChannel } from "discord.js"

export default class Eval extends TextCommand {
	constructor(client: BetterClient) {
		super("reset", client, {
			adminOnly: true,
		})
	}

	override async run(message: Message) {
		if (!message.channel.isTextBased()) return message.reply("This command can only be used in text channels.")
		const channel = message.channel as TextChannel
		if (channel.name !== "reset") return message.reply('This command can only be used in a channel called "reset" for safety reasons.')
		database.player.updateMany({
			data: {
				deathStatus: Death.ALIVE,
				money: 10,
				voteWorth: 1,
			},
		})
		await database.playerRoles.deleteMany()
		await database.playerItems.deleteMany()
		message.reply("Everyone is now alive")
	}
}
