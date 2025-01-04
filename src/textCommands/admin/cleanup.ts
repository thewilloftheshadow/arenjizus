import type { Message } from "discord.js"
import database from "~/database"
import { type BetterClient, TextCommand } from "~/lib"

export default class Cleanup extends TextCommand {
	constructor(client: BetterClient) {
		super("cleanup", client, {})
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
		const done = await database.playerAbilities.deleteMany({
			where: {
				usesLeft: 0,
				ability: {
					customOneOff: true
				}
			}
		})
		const done2 = await database.ability.deleteMany({
			where: {
				customOneOff: true,
				playersWithAbility: {
					none: {}
				}
			}
		})
		message.reply(
			`Cleaned up ${done} playerAbility entries and ${done2} ability entries`
		)
	}
}
