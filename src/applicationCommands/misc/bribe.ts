import { ApplicationCommand, type BetterClient } from "~/lib"
import type { ChatInputCommandInteraction } from "discord.js"

export default class Command extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("bribe", client, {
			description: ":D"
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		return interaction.reply(
			`Money? Money. Money! MONEYYYYY\n[Shadow's Ko-fi](https://ko-fi.com/theshadow)\n[Turkey's Ko-fi](https://example.com)\n[Seven's Ko-fi](https://example.com)`
		)
	}
}
