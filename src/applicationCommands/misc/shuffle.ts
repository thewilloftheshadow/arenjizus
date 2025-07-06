import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction
} from "discord.js"
import { shuffle } from "~/functions/shuffle"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Shuffle extends ApplicationCommand {
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
