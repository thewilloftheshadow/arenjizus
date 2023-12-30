import { ApplicationCommand } from "@buape/lib"
import { BetterClient } from "@buape/lib"
import database, {
	Death,
	addMoney,
	getAllPlayers,
	getPlayer,
	playerEmbed,
	removeMoney
} from "@internal/database"
import { generateErrorMessage, getPlayerChannel } from "@internal/functions"
import { logger } from "@internal/logger"
import { Prisma } from "@prisma/client"
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	EmbedBuilder
} from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("player", client, {
			description: `Manage a player in the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "public-version",
							description:
								"Whether to show the public version of the player (hiding notes, etc)",
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "create",
					description: "Create a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "money",
							description: "The amount of money the player has"
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "update",
					description: "update a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "money",
							description: "The amount of money the player has"
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "robberies-left",
							description: "The amount of robberies the player has left"
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "new-name",
							description: "A new name for this player"
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "delete",
					description: "Delete a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true,
							autocomplete: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "list",
					description: "List all players with their roles",
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "public-version",
							description: "Whether to show the public version of the list",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "transfer",
					description: "Transfer money between players",
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
							type: ApplicationCommandOptionType.Integer,
							name: "amount",
							description: "The amount to update the balance by",
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "link",
					description: "Link a player to their Discord account",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.User,
							name: "user",
							description: "The Discord user to link to",
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "note",
					description: "Add a note on a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the player",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "note",
							description: "The note to add",
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
		const allPlayers = await getAllPlayers()
		switch (option.name) {
			case "name":
			case "from":
			case "to":
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(
						players.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
				}
				return interaction.respond(
					allPlayers.map((player: { name: string }) => ({
						name: player.name,
						value: player.name
					}))
				)
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const type = interaction.options.getSubcommand(false)
		const name = interaction.options.getString("name") || ""

		switch (type) {
			case "view": {
				const player = await getPlayer(name)
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `A player named ${name} was not found in the database.`
						})
					)
				}
				return interaction.editReply({
					embeds: [playerEmbed(player, interaction.options.getBoolean("public-version", true))],
				})
			}
			case "create": {
				const create: Prisma.PlayerCreateInput = {
					name
				}
				const money = interaction.options.getInteger("money")
				if (money) create.money = money
				const player = await database.player.create({
					data: {
						name
					},
					include: {
						roles: true,
						items: true,
						abilities: true
					}
				})
				logger.gameLog(`Player ${player.name} was created.`)
				return interaction.editReply({
					content: "Player successfully created:",
					embeds: [playerEmbed(player)]
				})
			}
			case "update": {
				let player = await getPlayer(name)
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${name} was not found in the database.`
						})
					)
				}
				const data: Prisma.PlayerUpdateInput = {}
				const money = interaction.options.getInteger("money")
				const newName = interaction.options.getString("new-name")
				const robberiesLeft = interaction.options.getInteger("robberies-left")
				logger.gameLog(
					`Player ${player.name} was updated. ${
						money ? `Money: ${money}` : ""
					} ${newName ? `Name: ${newName}` : ""} ${
						robberiesLeft ? `Robberies left: ${robberiesLeft}` : ""
					}`
				)
				if (money) data.money = money
				if (newName) data.name = newName
				if (robberiesLeft) data.robberiesLeft = robberiesLeft
				player = await database.player.update({
					where: {
						id: player.id
					},
					data,
					include: {
						items: true,
						roles: true,
						ballData: true,
						abilities: true
					}
				})
				if (!player) throw new Error("Player not found")
				return interaction.editReply({
					content: "Player successfully updated:",
					embeds: [playerEmbed(player)]
				})
			}
			case "delete": {
				const player = await database.player.findFirst({
					where: {
						name
					}
				})
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${name} was not found in the database.`
						})
					)
				}
				await database.playerRoles.deleteMany({
					where: {
						player: {
							id: player.id
						}
					}
				})
				await database.playerItems.deleteMany({
					where: {
						player: {
							id: player.id
						}
					}
				})

				await database.player.delete({
					where: {
						id: player.id
					}
				})
				logger.gameLog(`Player ${player.name} was deleted.`)
				return interaction.editReply({
					content: "Player successfully deleted."
				})
			}
			case "list": {
				const publicVersion =
					interaction.options.getBoolean("public-version") || false
				const players = await getAllPlayers()
				const embed = new EmbedBuilder()
					.setTitle("All Players")
					.setDescription("\n")
					.setFooter({
						text: publicVersion
							? `${
									players.filter((x) => x.deathStatus === Death.ALIVE).length
							  } alive, ${
									players.filter((x) => x.deathStatus !== Death.ALIVE).length
							  } dead`
							: `${
									players.filter((x) => x.deathStatus === Death.ALIVE).length
							  } alive, ${
									players.filter((x) => x.deathStatus === Death.DEAD).length
							  } dead, ${
									players.filter((x) => x.deathStatus === Death.FAKED).length
							  } faked`
					})
				// biome-ignore lint/complexity/noForEach: no
				players
					.sort((a, b) => {
						if (a.name < b.name) {
							return -1
						}
						if (a.name > b.name) {
							return 1
						}
						return 0
					})
					.forEach((player) => {
						const deathEmoji =
							player.deathStatus === Death.ALIVE
								? "😃"
								: player.deathStatus === Death.DEAD ||
									  (player.deathStatus === Death.FAKED &&
											publicVersion === true)
								  ? "💀"
								  : player.deathStatus === Death.FAKED &&
										  publicVersion === false
									  ? "👻"
									  : "??"
						embed.data.description += `${deathEmoji} ${player.name}${
							publicVersion
								? "\n"
								: ` - ${player.roles
										.map((role) => role.roleName)
										.join(", ")} ($${player.money})\n`
						}`
					})

				if (publicVersion) {
					return interaction.editReply({ embeds: [embed] })
				}
				await interaction.editReply("Sent")
				return interaction.followUp({ embeds: [embed], ephemeral: true })
			}
			case "transfer": {
				const from = interaction.options.getString("from", true)
				const to = interaction.options.getString("to", true)
				const amount = interaction.options.getInteger("amount", true)
				const fromPlayer = await getPlayer(from)
				const toPlayer = await getPlayer(to)
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
				if (fromPlayer.money < amount) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Insufficient funds",
							description: `The player ${from} does not have enough money to transfer ${amount} to ${to}.`
						})
					)
				}
				removeMoney(fromPlayer.name, amount)
				addMoney(toPlayer.name, amount)
				logger.gameLog(`Player ${from} transferred ${amount} to ${to}.`)
				await interaction.editReply({
					content: `${amount} has been successfully transferred.`
				})
				try {
					const toPlayerChannel = await getPlayerChannel(
						toPlayer.name,
						this.client
					)
					if (toPlayerChannel) {
						toPlayerChannel.send(
							`You have received ${amount} from ${fromPlayer.name}.`
						)
					}
				} catch (_e) {
					interaction.followUp(`Failed to send message to ${toPlayer.name}.`)
				}
				return
			}
			case "link": {
				const user = interaction.options.getUser("user", true)
				if (!user)
					return interaction.editReply("You must specify a user to link to.")
				const player = await database.player.findFirst({
					where: {
						name
					}
				})
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${name} was not found in the database.`
						})
					)
				}
				const linked = await database.player.findFirst({
					where: {
						discordId: user.id
					}
				})
				if (linked) {
					return interaction.editReply(
						generateErrorMessage({
							title: "User already linked",
							description: `The user ${user.tag} is already linked to ${linked.name}.`
						})
					)
				}
				await database.player.update({
					where: {
						id: player.id
					},
					data: {
						discordId: user.id
					},
					include: {
						items: true,
						roles: true
					}
				})
				return interaction.editReply({
					content: `Player has been linked to <@${user.id}>`
				})
			}
			case "note": {
				const note = interaction.options.getString("note", true)
				const player = await database.player.findFirst({
					where: {
						name
					}
				})
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${name} was not found in the database.`
						})
					)
				}
				await database.playerNotes.create({
					data: {
						player: {
							connect: {
								id: player.id
							}
						},
						note,
						author: interaction.user.username
					}
				})
				return interaction.editReply({
					content: `Note has been added to ${player.name}`
				})
			}
			default:
				break
		}
	}
}
