import { ApplicationCommand } from "@buape/lib"
import { BetterClient } from "@buape/lib"
import {
	getPlayer,
	givePlayerItem,
	removePlayerItem,
	setPlayerMoney
} from "@internal/database"
import { logger } from "@internal/logger"
import { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("loot", client, {
			description: `Loot a player's items and money`,
			restriction: "gamemaster",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "from",
					description: "The player to loot from",
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "to",
					description: "The player to loot to",
					required: true
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		if (!interaction.guild) return
		const from = await getPlayer(interaction.options.getString("from", true))
		const to = await getPlayer(interaction.options.getString("to", true))
		if (!from) {
			return interaction.editReply("Invalid from")
		}
		if (!to) {
			return interaction.editReply("Invalid to")
		}

		const itemList: { name: string; amount: number }[] = []
		for await (const item of from.items) {
			const list = itemList.find((i) => i.name === item.itemName)
			if (list) {
				list.amount += item.amount
			} else {
				itemList.push({
					name: item.itemName,
					amount: item.amount
				})
			}
			givePlayerItem(to.name, item.itemName, item.amount)
			removePlayerItem(from.name, item.itemName, item.amount)
		}
		await setPlayerMoney(to.name, to.money + from.money)
		await setPlayerMoney(from.name, 0)
		await interaction.editReply(`Looted ${from.name} to ${to.name}`)
		logger.gameLog(
			`${to.name} looted ${from.name} and got ${from.money} money and ${
				from.items.length
			} items: ${itemList.map((i) => `${i.name} x${i.amount}`).join(", ")}`
		)
	}
}
