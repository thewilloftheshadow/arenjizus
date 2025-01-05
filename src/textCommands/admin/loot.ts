import type { Message } from "discord.js"
import database from "~/database"
import { grantAbility } from "~/database/ability"
import { type BetterClient, TextCommand } from "~/lib"

export default class Loot extends TextCommand {
	constructor(client: BetterClient) {
		super("loot", client, {})
	}

	override async run(message: Message) {
		if (
			![
				"960888903764676618",
				"389840562112561183",
				"439223656200273932"
			].includes(message.author.id)
		)
			return
		if (!message.channel.isSendable()) return
		const players = await database.player.findMany()
		players.map((a) => grantAbility(a.name, "Loot a Body"))
		message.reply("Loot ability granted to all players")
	}
}
