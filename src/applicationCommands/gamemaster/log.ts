import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

export default class Log extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("log", client, {
			description: `Add an entry to the game log`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "entry",
					description: "The entry to add",
					required: true
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const entry = interaction.options.getString("entry", true)
		logger.gameLog(entry)
		interaction.reply({ content: `Added to the game log`, ephemeral: true })
	}
}
