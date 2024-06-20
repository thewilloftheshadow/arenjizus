import { ApplicationCommand } from "@buape/lib"
import type { BetterClient } from "@buape/lib"
import database, {
	Death,
	getPlayer,
	givePlayerItem,
	removePlayerItem,
	setPlayerMoney
} from "@internal/database"
import { logger } from "@internal/logger"
import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("loot", client, {
			description: `Loot a player's items and money`,
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
		await interaction.deferReply({ ephemeral: true })
		if (!interaction.guild) return
		const from = await getPlayer(interaction.options.getString("from", true))
		const to = await getPlayer(interaction.options.getString("to", true))
		if (!from) {
			return interaction.editReply("Invalid from")
		}
		if (!to) {
			return interaction.editReply("Invalid to")
		}

		if (from.deathStatus !== Death.DEAD) {
			return interaction.editReply(`${to.name} is not dead`)
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
		const investmentCount = from.investments.length
		await database.investment.updateMany({
			where: {
				player: {
					id: from.id
				}
			},
			data: {
				playerName: to.name
			}
		})
		await setPlayerMoney(to.name, to.money + from.money)
		await setPlayerMoney(from.name, 0)
		await interaction.editReply(`Done`)
		await interaction.followUp(`Looted ${from.name} to ${to.name}`)
		logger.gameLog(
			`${to.name} looted ${from.name} and got ${
				from.money
			} money, ${investmentCount} investments, and ${
				from.items.length
			} items: ${itemList.map((i) => `${i.name} x${i.amount}`).join(", ")}`
		)
	}
}
