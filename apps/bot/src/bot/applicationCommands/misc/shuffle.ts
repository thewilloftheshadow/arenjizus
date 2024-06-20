import { ApplicationCommand, type BetterClient } from "@buape/lib"
import { shuffle } from "@internal/functions"
import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction
} from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("shuffle", client, {
			description: `Shuffle a list of items`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "items",
					description: "The items to shuffle, separated by commas",
					required: true
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const items = interaction.options.getString("items", true)
		const itemList = items.split(",")
		const shuffledItems = shuffle(itemList)
		const shuffledItemsString = shuffledItems.join(", ")
		await interaction.reply(`${shuffledItemsString}`)
	}
}
