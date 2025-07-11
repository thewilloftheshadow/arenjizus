import type {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"
import database from "~/database"
import { itemEmbed } from "~/database/embeds"
import {
	getAllItems,
	getAllPlayers,
	getItem,
	getPlayer,
	getPlayerItem
} from "~/database/getData"
import {
	deleteItem,
	givePlayerItem,
	removeMoney,
	removePlayerItem
} from "~/database/thingys"
import { generateErrorMessage } from "~/functions/generateMessage"
import { getPlayerChannel } from "~/functions/player"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

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
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to give",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "payment",
							description: "Deduct the price from the players balance?",
							required: true
						}
					]
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
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to revoke",
							required: true
						}
					]
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
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "hide_users",
							description: "Whether to hide the users with this item",
							required: false
						}
					]
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
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the item",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "price",
							description: "The price of the item",
							required: true
						}
					]
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
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the item",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "price",
							description: "The price of the item",
							required: true
						}
					]
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
							autocomplete: true
						}
					]
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
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "to",
							description: "The name of the player to transfer to",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The item to transfer",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to transfer",
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "bulk-transfer",
					description: "Bulk transfer items between players",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "from",
							description: "The name of the player to transfer from",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The item to transfer",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to transfer",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "show_from",
							description: "Whether to show the player its from (default yes)",
							required: false
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "dead",
							description:
								"Whether dead players should be included (default no)",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "bulk",
					description: "Give an item to every alive player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "item",
							description: "The name of the item",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount of items to give to each player",
							required: true
						}
					]
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	) {
		const allItems = await getAllItems()
		const allPlayers = await getAllPlayers()
		switch (option.name) {
			case "item":
			case "name":
				if (option.value) {
					const items = allItems.filter((item: { name: string }) =>
						item.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction
						.respond(
							items.map((item: { name: string }) => ({
								name: item.name,
								value: item.name
							}))
						)
						.catch(() => {})
				}
				return interaction
					.respond(
						allItems.map((item: { name: string }) => ({
							name: item.name,
							value: item.name
						}))
					)
					.catch(() => {})

			case "player":
			case "from":
			case "to":
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction
						.respond(
							players.map((player: { name: string }) => ({
								name: player.name,
								value: player.name
							}))
						)
						.catch(() => {})
				}
				return interaction
					.respond(
						allPlayers.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
					.catch(() => {})
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const type = interaction.options.getSubcommand(false)
		if (type === "bulk") {
			await interaction.deferReply({ ephemeral: true })
		} else {
			await interaction.deferReply()
		}
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
						return interaction.editReply(
							`The player does not have enough money to buy ${amount} ${itemName}`
						)
					}
					removeMoney(player.name, cost)
				}
				givePlayerItem(player.name, item.name, amount)

				logger.gameLog(`${playerName} has been given ${amount} ${itemName}`)
				return interaction.editReply(
					`${playerName} has been given ${amount} ${itemName}`
				)
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
				if (!playerItemData)
					return interaction.reply("Player does not have this item")
				removePlayerItem(player.name, item.name, amount)
				logger.gameLog(
					`${playerName} has had ${amount} of their ${itemName} revoked`
				)
				return interaction.editReply(
					`${playerName} has had ${amount} of their ${itemName} revoked`
				)
			}

			case "view": {
				const item = await getItem(name)
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`
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
						price: interaction.options.getInteger("price", true)
					},
					include: {
						players: true,
						linkedAbilities: true
					}
				})
				logger.gameLog(`Item ${item.name} was created.`)
				return interaction.editReply({
					content: "Item successfully created:",
					embeds: [itemEmbed(item)]
				})
			}
			case "update": {
				let item = await database.item.findFirst({
					where: {
						name
					},
					include: {
						players: true,
						linkedAbilities: true
					}
				})
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`
						})
					)
				}
				item = await database.item.update({
					where: {
						id: item.id
					},
					data: {
						description: interaction.options.getString("description") || "",
						price: interaction.options.getInteger("price", true)
					},
					include: {
						players: true,
						linkedAbilities: true
					}
				})
				logger.gameLog(
					`Item ${item.name} was updated, description: ${
						interaction.options.getString("description") || ""
					}, price: ${interaction.options.getInteger("price", true)}.`
				)
				return interaction.editReply({
					content: "Item successfully updated:",
					embeds: [itemEmbed(item)]
				})
			}
			case "delete": {
				const item = await getItem(name)
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`
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
							description: `The player ${from} was not found in the database.`
						})
					)
				}
				if (!toPlayer) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${to} was not found in the database.`
						})
					)
				}
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`
						})
					)
				}
				const fromPlayerItemData = await getPlayerItem(
					fromPlayer.name,
					item.name
				)
				if (!fromPlayerItemData) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player does not have this item",
							description: `${from} does not have ${name}`
						})
					)
				}
				if (fromPlayerItemData.amount < amount) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player does not have enough of this item",
							description: `${from} does not have ${amount} ${name}`
						})
					)
				}
				removePlayerItem(fromPlayer.name, item.name, amount)
				givePlayerItem(toPlayer.name, item.name, amount)
				logger.gameLog(`${from} gave ${amount} ${name} to ${to}.`)
				const toPlayerChannel = await getPlayerChannel(
					toPlayer.name,
					this.client
				)
				interaction.editReply({
					content: `${amount}x ${item.name} has been successfully transferred.`
				})
				if (toPlayerChannel) {
					toPlayerChannel.send(
						`You have received ${amount}x ${item.name} from ${fromPlayer.name}.`
					)
				} else {
					interaction.followUp(`Failed to send message to ${toPlayer.name}.`)
				}
				return
			}
			case "bulk-transfer": {
				const from = interaction.options.getString("from", true)
				const itemName = interaction.options.getString("name", true)
				const amount = interaction.options.getInteger("amount", true)
				const showFrom =
					interaction.options.getBoolean("show_from", false) || true
				const allowDead = interaction.options.getBoolean("dead", false) || false
				const fromPlayer = await getPlayer(from)
				const item = await getItem(itemName)
				if (!fromPlayer) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${from} was not found in the database.`
						})
					)
				}
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${name} was not found in the database.`
						})
					)
				}
				const players = (await getAllPlayers()).filter((player) => {
					if (allowDead) return true
					if (player.name === fromPlayer.name) return false
					return player.isAlive
				})
				const neededAmount = amount * players.length

				const fromPlayerItems = fromPlayer.items.find(
					(item) => item.itemName === itemName
				)
				const hasEnough = (fromPlayerItems?.amount || 0) >= neededAmount
				if (!hasEnough) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player does not have enough of this item",
							description: `${from} does not have ${neededAmount} ${name} needed for all transfers`
						})
					)
				}
				for (const player of players) {
					await removePlayerItem(fromPlayer.name, item.name, amount)
					await givePlayerItem(player.name, item.name, amount)
					logger.gameLog(`${from} gave ${amount} ${name} to ${player.name}.`)
					const playerChannel = await getPlayerChannel(player.name, this.client)
					interaction.editReply({
						content: `${amount}x ${item.name} has been successfully transferred to ${players.length} players (total ${neededAmount}).`
					})
					if (playerChannel) {
						playerChannel.send(
							`You have received ${amount}x ${item.name}${showFrom ? ` from ${fromPlayer.name}` : ""}.`
						)
					} else {
						interaction.followUp(`Failed to send message to ${player.name}.`)
					}
				}
				break
			}
			case "bulk": {
				const itemName = interaction.options.getString("item", true)
				const amount = interaction.options.getInteger("amount", true)
				const item = await getItem(itemName)
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${itemName} was not found in the database.`
						})
					)
				}
				const players = (await getAllPlayers()).filter(
					(player) => player.isAlive
				)
				const recipients: string[] = []
				for (const player of players) {
					await givePlayerItem(player.name, item.name, amount)
					recipients.push(player.name)
					logger.gameLog(
						`${player.name} has been given ${amount} ${item.name} (bulk)`
					)
				}
				return interaction.editReply({
					content: `Gave ${amount}x ${item.name} to every alive player.\nRecipients: ${recipients.join(", ")}`
				})
			}
			default:
				break
		}
	}
}
