import { ChatInputCommandInteraction } from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"


export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("log", client, {
			description: `Add an entry to the game log`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "entry",
					description: "The entry to add",
					required: true,
				},
			],
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const entry = interaction.options.getString("entry", true)
		logger.gameLog(entry)
		interaction.reply({ content: `Added to the game log`, ephemeral: true })
	}
}
