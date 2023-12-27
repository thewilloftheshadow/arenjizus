import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommand, BetterClient } from "@buape/lib"
import { shuffle } from "@internal/functions"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("shuffle", client, {
			description: `Shuffle a list of items`,
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
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
