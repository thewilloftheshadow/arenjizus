import type { Prisma } from "@prisma/client"
import {
	ApplicationCommandOptionType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	EmbedBuilder
} from "discord.js"
import { serverIds } from "~/config"
import database from "~/database"
import { playerEmbed } from "~/database/embeds"
import { getAllPlayers, getPlayer } from "~/database/getData"
import { addMoney, removeMoney } from "~/database/thingys"
import { generateErrorMessage } from "~/functions/generateMessage"
import { getPlayerChannel } from "~/functions/player"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

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
							type: ApplicationCommandOptionType.User,
							name: "discord",
							description: "The Discord account of the player",
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
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "alive-only",
							description: "Whether to only show alive players",
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
					type: ApplicationCommandOptionType.SubcommandGroup,
					name: "money",
					description: "Manage a player's money",
					options: [
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "add",
							description: "Add money to a player",
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
									name: "amount",
									description: "The amount to add",
									required: true
								}
							]
						},
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "remove",
							description: "Remove money from a player",
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
									name: "amount",
									description: "The amount to remove",
									required: true
								}
							]
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
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "reset",
					description: "Reset all players"
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
		if (!interaction.guild) return
		await interaction.deferReply({
			ephemeral: !(
				interaction.options.getBoolean("public-version", false) || false
			)
		})
		const type = interaction.options.getSubcommand(false)
		const group = interaction.options.getSubcommandGroup(false)
		const name = interaction.options.getString("name") || ""

		switch (group) {
			case "money": {
				switch (type) {
					case "add": {
						const name = interaction.options.getString("name", true)
						const amount = interaction.options.getInteger("amount", true)
						addMoney(name, amount)
						logger.gameLog(`Player ${name} was given $${amount}.`)
						return interaction.editReply({
							content: `Player ${name} was given $${amount}.`
						})
					}
					case "remove": {
						const name = interaction.options.getString("name", true)
						const amount = interaction.options.getInteger("amount", true)
						removeMoney(name, amount)
						logger.gameLog(`Player ${name} has had $${amount} removed.`)
						return interaction.editReply({
							content: `Player ${name} has had $${amount} removed.`
						})
					}
					default:
						break
				}
				break
			}
		}

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
					embeds: [
						playerEmbed(
							player,
							!interaction.options.getBoolean("public-version", true)
						)
					]
				})
			}
			case "create": {
				const create: Prisma.PlayerCreateInput = {
					name
				}
				const money = interaction.options.getInteger("money")
				const discord = interaction.options.getUser("discord")
				if (money) create.money = money
				if (discord) {
					const player = await database.player.create({
						data: {
							name,
							discordId: discord.id
						},
						include: {
							roles: true,
							items: true,
							abilities: true
						}
					})
					const existingChannel = await getPlayerChannel(name, this.client)
					if (!existingChannel) {
						const channel = await interaction.guild.channels.create({
							name: `gm-${name}`,
							parent: "1105539810069860411"
						})
						await channel.lockPermissions()
						await channel.permissionOverwrites.create(discord.id, {
							ViewChannel: true
						})
						const member = await interaction.guild.members.fetch(discord.id)
						await member.roles.add(serverIds.roles.player)
						await member.roles.remove(serverIds.roles.spectator)
						await member.setNickname(name).catch(() => {})
						channel.send({
							content: `Welcome to the game, ${name}!`
						})
					}
					logger.gameLog(
						`${name} has joined the game, linked to <@${discord.id}>!`
					)
					return interaction.editReply({
						content: "Player successfully created:",
						embeds: [playerEmbed(player)]
					})
				}
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
						abilities: true,
						notes: true,
						location: true,
						investments: true
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
				const aliveOnly = interaction.options.getBoolean("alive-only") || false
				const players = await getAllPlayers()
				const embed = new EmbedBuilder()
					.setTitle("All Players")
					.setDescription("\n")
					.setFooter({
						text: publicVersion
							? `${players.filter((x) => x.isAlive).length} alive, ${
									players.filter((x) => !x.isAlive).length
								} dead`
							: `${players.filter((x) => x.isAlive).length} alive, ${
									players.filter((x) => !x.isAlive).length
								} dead, ${
									players.filter((x) => !x.isAlive && x.isFaked).length
								} faked`
					})
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
					.filter((player) => {
						if (aliveOnly) {
							return player.isAlive
						}
						return true
					})
					.forEach((player) => {
						const deathEmoji = player.isAlive
							? "😃"
							: !player.isAlive
								? player.isFaked
									? publicVersion
										? "💀"
										: "👻"
									: "💀"
								: "??"
						embed.data.description += `${deathEmoji} ${player.name}${
							publicVersion
								? "\n"
								: ` - ${player.roles
										.map((role) => role.roleName)
										.join(", ")} ($${player.money}, ${
										player.location
											? player.location.name
											: "No location selected"
									})\n`
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
							description: `The player ${from} does not have enough money to transfer $${amount} to ${to}.`
						})
					)
				}
				removeMoney(fromPlayer.name, amount)
				addMoney(toPlayer.name, amount)
				logger.gameLog(`Player ${from} transferred $${amount} to ${to}.`)
				await interaction.editReply({
					content: `$${amount} has been successfully transferred.`
				})
				const toPlayerChannel = await getPlayerChannel(
					toPlayer.name,
					this.client
				)
				if (toPlayerChannel) {
					toPlayerChannel.send(
						`You have received $${amount} from ${fromPlayer.name}.`
					)
				} else {
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
			case "reset": {
				const allPlayers = await getAllPlayers()
				for (const player of allPlayers) {
					if (!player.discordId) continue
					const member = await interaction.guild.members.fetch(player.discordId)
					if (!member) continue
					await member.roles.remove(serverIds.roles.player).catch(() => {})
					await member.roles.remove(serverIds.roles.dead).catch(() => {})
					await member.roles.add(serverIds.roles.spectator).catch(() => {})

					const channel = await getPlayerChannel(player.name, this.client)
					if (channel) {
						await channel.permissionOverwrites.delete(member.id).catch(() => {})
					}
				}
				return interaction.editReply({
					content: "Players have been reset"
				})
			}
			default:
				break
		}
	}
}
