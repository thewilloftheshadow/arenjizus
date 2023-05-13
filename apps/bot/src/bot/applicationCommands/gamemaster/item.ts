import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"
import database, {
	deleteItem,
	getAllItems,
	getAllPlayers,
	getItem,
	getPlayer,
	getPlayerItem,
	givePlayerItem,
	itemEmbed,
	removeMoney,
	removePlayerItem,
} from "@internal/database"
import { generateErrorMessage } from "@internal/functions"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("item", client, {
			description: `Manage an item in the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "give",
					description: "Give an item to a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "item",
							description: "The name of the item",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to give",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "payment",
							description: "Deduct the price from the players balance?",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "revoke",
					description: "Revoke an item from a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "item",
							description: "The name of the item",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to revoke",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View an item",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the item",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "hide_users",
							description: "Whether to hide the users with this item",
							required: false,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "create",
					description: "Create an item",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the item",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the item",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "price",
							description: "The price of the item",
							required: true,
						},
					],
				},

				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "update",
					description: "Update an item",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the item",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the item",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "price",
							description: "The price of the item",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "delete",
					description: "Delete an item",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the item",
							required: true,
							autocomplete: true,
						},
					],
				},

				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "transfer",
					description: "Transfer items between players",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "from",
							description: "The name of the player to transfer from",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "to",
							description: "The name of the player to transfer to",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The item to transfer",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to transfer",
							required: true,
						},
					],
				},
			],
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction, option: AutocompleteFocusedOption) {
		console.log(option)
		switch (option.name) {
			case "item":
			case "name":
				console.log(option.name)

				const allItems = await getAllItems()
				console.log(allItems)
				if (option.value) {
					const items = allItems.filter((item: { name: string }) => item.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(items.map((item: { name: string }) => ({ name: item.name, value: item.name })))
				}
				return interaction.respond(allItems.map((item: { name: string }) => ({ name: item.name, value: item.name })))

			case "player":
			case "from":
			case "to":
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) => player.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(players.map((player: { name: string }) => ({ name: player.name, value: player.name })))
				}
				return interaction.respond(allPlayers.map((player: { name: string }) => ({ name: player.name, value: player.name })))
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const type = interaction.options.getSubcommand(false)
		const name = interaction.options.getString("name") || ""

		switch (type) {
			case "give": {
				const itemName = interaction.options.getString("item", true)
				const playerName = interaction.options.getString("player", true)
				const amount = interaction.options.getInteger("amount", true)
				const payment = interaction.options.getBoolean("payment", true)
				const item = await getItem(itemName)
				const player = await getPlayer(playerName)
				if (!item) return interaction.reply("Item not found")
				if (!player) return interaction.reply("Player not found")
				const cost = amount * item.price
				if (payment) {
					if (player.money < cost) {
						return interaction.editReply(`The player does not have enough money to buy ${amount} ${itemName}`)
					}
					removeMoney(player.name, cost)
				}
				givePlayerItem(player.name, item.name, amount)

				logger.gameLog(`${playerName} has been given ${amount} ${itemName}`)
				return interaction.editReply(`${playerName} has been given ${amount} ${itemName}`)
			}
			case "revoke": {
				const itemName = interaction.options.getString("item", true)
				const playerName = interaction.options.getString("player", true)
				const item = await getItem(itemName)
				const player = await getPlayer(playerName)
				if (!item) return interaction.reply("Item not found")
				if (!player) return interaction.reply("Player not found")
				const amount = interaction.options.getInteger("amount", true)
				const playerItemData = await getPlayerItem(player.name, item.name)
				if (!playerItemData) return interaction.reply("Player does not have this item")
				removePlayerItem(player.name, item.name, amount)
				logger.gameLog(`${playerName} has had ${amount} of their ${itemName} revoked`)
				return interaction.editReply(`${playerName} has had ${amount} of their ${itemName} revoked`)
			}

			case "view": {
				const item = await getItem(name)
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`,
						})
					)
				}

				const hideUsers = interaction.options.getBoolean("hide_users") || false
				return interaction.editReply({ embeds: [itemEmbed(item, hideUsers)] })
			}
			case "create": {
				const item = await database.item.create({
					data: {
						name,
						description: interaction.options.getString("description") || "",
						price: interaction.options.getInteger("price", true),
					},
					include: {
						players: true,
						linkedAbilities: true,
					},
				})
				logger.gameLog(`Item ${item.name} was created.`)
				return interaction.editReply({ content: "Item successfully created:", embeds: [itemEmbed(item)] })
			}
			case "update": {
				let item = await database.item.findFirst({
					where: {
						name,
					},
					include: {
						players: true,
						linkedAbilities: true,
					},
				})
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`,
						})
					)
				}
				item = await database.item.update({
					where: {
						id: item.id,
					},
					data: {
						description: interaction.options.getString("description") || "",
						price: interaction.options.getInteger("price", true),
					},
					include: {
						players: true,
						linkedAbilities: true,
					},
				})
				logger.gameLog(
					`Item ${item.name} was updated, description: ${
						interaction.options.getString("description") || ""
					}, price: ${interaction.options.getInteger("price", true)}.`
				)
				return interaction.editReply({ content: "Item successfully updated:", embeds: [itemEmbed(item)] })
			}
			case "delete": {
				const item = await getItem(name)
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`,
						})
					)
				}
				await deleteItem(item.name)
				logger.gameLog(`Item ${item.name} was deleted.`)
				return interaction.editReply({ content: "Item successfully deleted." })
			}
			case "transfer": {
				const from = interaction.options.getString("from", true)
				const to = interaction.options.getString("to", true)
				const itemName = interaction.options.getString("name", true)
				const amount = interaction.options.getInteger("amount", true)
				const fromPlayer = await getPlayer(from)
				const toPlayer = await getPlayer(to)
				const item = await getItem(itemName)
				if (!fromPlayer) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${from} was not found in the database.`,
						})
					)
				}
				if (!toPlayer) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${to} was not found in the database.`,
						})
					)
				}
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`,
						})
					)
				}
				const fromPlayerItemData = await getPlayerItem(fromPlayer.name, item.name)
				if (!fromPlayerItemData) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player does not have this item",
							description: `${from} does not have ${name}`,
						})
					)
				}
				if (fromPlayerItemData.amount < amount) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player does not have enough of this item",
							description: `${from} does not have ${amount} ${name}`,
						})
					)
				}
				removePlayerItem(fromPlayer.name, item.name, amount)
				givePlayerItem(toPlayer.name, item.name, amount)
				logger.gameLog(`${from} gave ${amount} ${name} to ${to}.`)
				return interaction.editReply({ content: `${amount}x ${item.name} has been successfully transferred.` })
			}
			default:
				break
		}
	}
}
