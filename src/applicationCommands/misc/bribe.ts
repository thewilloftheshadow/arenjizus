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
			`The <@&1105539807444217874>s are very bribable! :D\nJust list who you want the money to go to at https://ko-fi.com/theshadow`
		)
	}
}
