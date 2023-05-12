import { AutocompleteFocusedOption, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"
import database, { getAllPlayers, getAllRoles, getPlayer, getPlayerRole, getRole, givePlayerRole, roleEmbed } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("role", client, {
			description: `Manage an role in the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "assign",
					description: "Assign a role to a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "role",
							description: "The name of the role",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "unassign",
					description: "Unassign a role to a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "role",
							description: "The name of the role",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View an role",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the role",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "hide_users",
							description: "Whether to hide the users with this role",
							required: false,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "create",
					description: "Create an role",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the role",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the role",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "update",
					description: "Update an role",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the role",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the role",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "delete",
					description: "Delete an role",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the role",
							required: true,
							autocomplete: true,
						},
					],
				},
			],
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction, option: AutocompleteFocusedOption) {
		switch (option.name) {
			case "player": {
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) => player.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(players.map((player: { name: string }) => ({ name: player.name, value: player.name })))
				}
				return interaction.respond(allPlayers.map((player: { name: string }) => ({ name: player.name, value: player.name })))
			}
			case "name":
			case "role":
				const allRoles = await getAllRoles()
				if (option.value) {
					const roles = allRoles.filter((role: { name: string }) => role.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(roles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
				}
				return interaction.respond(allRoles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const type = interaction.options.getSubcommand(false)
		const name = interaction.options.getString("name") || ""

		switch (type) {
			case "view": {
				const role = await getRole(name)
				if (!role) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Role not found",
							description: `The role ${name} was not found in the database.`,
						})
					)
				}
				const hideUsers = interaction.options.getBoolean("hide_users") || false
				return interaction.editReply({ embeds: [roleEmbed(role, hideUsers)] })
			}
			case "update": {
				let role = await getRole(name)
				if (!role) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Role not found",
							description: `The role ${name} was not found in the database.`,
						})
					)
				}
				role = await database.role.update({
					where: {
						id: role.id,
					},
					data: {
						description: interaction.options.getString("description") || "",
					},
					include: {
						players: true,
						linkedAbilities: true,
					},
				})
				logger.gameLog(`Role ${role.name} was updated.`)
				return interaction.editReply({ content: "Role successfully updated:", embeds: [roleEmbed(role)] })
			}
			case "create": {
				const role = await database.role.create({
					data: {
						name,
						description: interaction.options.getString("description") || "",
					},
					include: {
						players: true,
						linkedAbilities: true,
					},
				})
				logger.gameLog(`Role ${role.name} was created.`)
				return interaction.editReply({ content: "Role successfully created:", embeds: [roleEmbed(role)] })
			}
			case "delete": {
				const role = await database.role.findFirst({
					where: {
						name,
					},
				})
				if (!role) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Role not found",
							description: `The role ${name} was not found in the database.`,
						})
					)
				}
				await database.playerRoles.deleteMany({
					where: {
						role: {
							id: role.id,
						},
					},
				})
				await database.role.delete({
					where: {
						id: role.id,
					},
				})
				logger.gameLog(`Role ${role.name} was deleted.`)
				return interaction.editReply({ content: "Role successfully deleted." })
			}
			case "assign": {
				const playerName = interaction.options.getString("player", true)
				const roleName = interaction.options.getString("role", true)

				const role = await getRole(roleName)
				if (!role) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Role not found",
							description: `The role ${roleName} was not found in the database.`,
						})
					)
				}
				const player = await getPlayer(playerName)
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${playerName} was not found in the database.`,
						})
					)
				}
				await givePlayerRole(player.name, role.name)
				logger.gameLog(`Player ${player.name} was assigned to role ${role.name}.`)
				return interaction.editReply({ content: "Player successfully assigned to role." })
			}
			case "unassign": {
				const playerName = interaction.options.getString("player", true)
				const roleName = interaction.options.getString("role", true)

				const role = await getRole(roleName)
				if (!role) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Role not found",
							description: `The role ${roleName} was not found in the database.`,
						})
					)
				}
				const player = await getPlayer(playerName)
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${playerName} was not found in the database.`,
						})
					)
				}
				await getPlayerRole(player.name, role.name)
				logger.gameLog(`Player ${player.name} was unassigned from role ${role.name}.`)
				return interaction.editReply({ content: "Player successfully unassigned from role." })
			}
			default:
				break
		}
	}
}
