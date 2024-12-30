import type { Message, TextChannel } from "discord.js"
import database from "~/database"
import { type BetterClient, TextCommand } from "~/lib"

export default class Eval extends TextCommand {
	constructor(client: BetterClient) {
		super("reset", client, {
			restriction: "gamemaster"
		})
	}

	override async run(message: Message) {
		if (!message.channel.isTextBased())
			return message.reply("This command can only be used in text channels.")
		const channel = message.channel as TextChannel
		if (channel.name !== "reset")
			return message.reply(
				"This command can only be used in a channel called 'reset' for safety reasons."
			)
		await database.playerAbilities.deleteMany()
		await database.playerBallData.deleteMany()
		await database.playerRoles.deleteMany()
		await database.playerItems.deleteMany()
		await database.player.updateMany({
			data: {
				votedForName: null
			}
		})
		await database.player.deleteMany()
		message.reply("The database has been reset")
	}
}
