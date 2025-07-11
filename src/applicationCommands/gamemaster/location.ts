import {
	ApplicationCommandOptionType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	ChannelType,
	type ChatInputCommandInteraction,
	type GuildChannel
} from "discord.js"
import database from "~/database"
import { locationEmbed } from "~/database/embeds"
import { getAllLocations, getLocation } from "~/database/getData"
import { generateErrorMessage } from "~/functions/generateMessage"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("location", client, {
			description: `Manage an location in the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View an location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the location",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "hide_users",
							description: "Whether to hide the users in this location",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "create",
					description: "Create an location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the location",
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the location",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "max-players",
							description: "The max number of players in this location",
							required: false,
							minValue: 0
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "auto-message",
							description: "The message to send when the location is opened",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "update",
					description: "Update an location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the location",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the location",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "max-players",
							description: "The max number of players in this location",
							required: false,
							minValue: 0
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "delete",
					description: "Delete an location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the location",
							required: true,
							autocomplete: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "open",
					description: "Open all location channels for a new night"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "close",
					description: "Close all location channels for a new day"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "leftover",
					description: "Send all leftover players to a location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "location",
							description: "The name of the location",
							required: true,
							autocomplete: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "send",
					description: "Send a player to a location",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "location",
							description: "The name of the location",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The player to send",
							required: true,
							autocomplete: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					name: "require",
					description: "Lock a location to require something",
					options: [
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "item",
							description: "Lock a location to require an item",
							options: [
								{
									type: ApplicationCommandOptionType.String,
									name: "name",
									description: "The location to lock",
									required: true,
									autocomplete: true
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "item",
									description: "The item to require",
									required: true,
									autocomplete: true
								}
							]
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
		const allLocations = await getAllLocations()
		switch (option.name) {
			case "name":
			case "location":
				if (option.value) {
					const locations = allLocations.filter((location: { name: string }) =>
						location.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction
						.respond(
							locations.map((location: { name: string }) => ({
								name: location.name,
								value: location.name
							}))
						)
						.catch(() => {})
				}
				return interaction
					.respond(
						allLocations.map((location: { name: string }) => ({
							name: location.name,
							value: location.name
						}))
					)
					.catch(() => {})
			case "player": {
				const players = await database.player.findMany({
					where: {
						name: {
							contains: option.value
						}
					}
				})
				return interaction
					.respond(
						players.map((player) => ({
							name: player.name,
							value: player.name
						}))
					)
					.catch(() => {})
			}
			case "item": {
				const items = await database.item.findMany({
					where: {
						name: {
							contains: option.value
						}
					}
				})
				return interaction
					.respond(
						items.map((item) => ({
							name: item.name,
							value: item.name
						}))
					)
					.catch(() => {})
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild)
			return interaction.editReply("This command can only be used in a guild.")
		await interaction.deferReply()
		const type = interaction.options.getSubcommand(false)
		const name = interaction.options.getString("name") || ""
		const category = (
			await database.keyV.findFirst({
				where: {
					key: "locationCategory"
				}
			})
		)?.value
		if (!category) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Location category not found",
					description: "The location category was not found in the database."
				})
			)
		}

		switch (type) {
			case "view": {
				const location = await getLocation(name)
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				return interaction.editReply({
					embeds: [locationEmbed(location)]
				})
			}
			case "send": {
				const location = await getLocation(
					interaction.options.getString("location") || ""
				)
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				const player = await database.player.findFirst({
					where: {
						name: interaction.options.getString("player") || ""
					}
				})
				if (!player) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Player not found",
							description: `The player ${
								interaction.options.getString("player") || ""
							} was not found in the database.`
						})
					)
				}
				await database.player.update({
					where: {
						id: player.id
					},
					data: {
						locationId: location.id
					}
				})
				if (location.channel && player.discordId) {
					const channel = await interaction.guild.channels.fetch(
						location.channel
					)
					if (channel?.type !== ChannelType.GuildText || !channel?.guild) return
					if (channel) {
						await channel.permissionOverwrites.create(player.discordId, {
							ViewChannel: true
						})
					}
				}
				logger.gameLog(`${player.name} was manually sent to ${location.name}`)
				return interaction.editReply({
					content: `Successfully sent ${player.name} to ${location.name}`
				})
			}
			case "leftover": {
				const location = await getLocation(
					interaction.options.getString("location") || ""
				)
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				const players = await database.player.findMany({
					where: {
						locationId: null
					}
				})
				for (const player of players) {
					await database.player.update({
						where: {
							id: player.id
						},
						data: {
							locationId: location.id
						}
					})
					if (location.channel && player.discordId) {
						const channel = await interaction.guild.channels.fetch(
							location.channel
						)
						if (channel?.type !== ChannelType.GuildText || !channel?.guild)
							return
						if (channel) {
							await channel.permissionOverwrites
								.create(player.discordId, {
									ViewChannel: true
								})
								.catch(() => {})
						}
					}
					logger.gameLog(`${player.name} was sent to ${location.name}`)
				}
				return interaction.editReply({
					content: `Successfully sent all leftover players to ${location.name}`
				})
			}
			case "update": {
				const location = await getLocation(name)
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				const maxPlayers =
					interaction.options.getInteger("max-players") || location.maxPlayers
				const newLocation = await database.location.update({
					where: {
						id: location.id
					},
					data: {
						description: interaction.options.getString("description") || "",
						maxPlayers
					},
					include: {
						players: true
					}
				})
				logger.gameLog(`location ${location.name} was updated.`)
				return interaction.editReply({
					content: "location successfully updated:",
					embeds: [locationEmbed(newLocation)]
				})
			}
			case "create": {
				const location = await database.location.create({
					data: {
						name,
						description: interaction.options.getString("description") || "",
						maxPlayers: interaction.options.getInteger("max-players"),
						autoMessage: interaction.options.getString("auto-message")
					},
					include: {
						players: true
					}
				})
				logger.gameLog(`Location ${location.name} was created.`)
				return interaction.editReply({
					content: "Location successfully created:",
					embeds: [locationEmbed(location)]
				})
			}
			case "delete": {
				const location = await database.location.findFirst({
					where: {
						name
					}
				})
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				await database.location.delete({
					where: {
						id: location.id
					}
				})
				logger.gameLog(`Location ${location.name} was deleted.`)
				return interaction.editReply({
					content: "Location successfully deleted."
				})
			}
			case "open": {
				await database.player.updateMany({
					where: {
						isAlive: false,
						isFaked: false
					},
					data: {
						locationId: null
					}
				})
				const locations = await getAllLocations()
				for (const location of locations) {
					const channel = await interaction.guild?.channels.create({
						name: `${location.name.toLowerCase()}`,
						parent: category
					})
					if (!channel) {
						interaction.editReply(
							generateErrorMessage({
								title: "Failed to create channel",
								description: `The channel ${name.toLowerCase()} could not be created.`
							})
						)
						continue
					}
					await channel?.lockPermissions()
					await database.location.update({
						where: {
							id: location.id
						},
						data: {
							channel: channel.id
						},
						include: {
							players: true
						}
					})

					for (const player of location.players) {
						const discordPlayer = await interaction.guild?.members
							.fetch(player.discordId!)
							.catch(() => null)
						if (!discordPlayer) {
							interaction.editReply(
								generateErrorMessage({
									title: "Failed to fetch player",
									description: `The player ${player.name} could not be fetched.`
								})
							)
							continue
						}
						await channel.permissionOverwrites.create(discordPlayer, {
							ViewChannel: true
						})
					}
					if (location.autoMessage) {
						await channel.send(location.autoMessage)
					}
				}
				return interaction.editReply({
					content: "Channels successfully created."
				})
			}
			case "close": {
				const locationChannels = await interaction.guild?.channels.cache.filter(
					(c) => c.parentId === category
				)
				if (!locationChannels)
					return interaction.editReply("No channels found.")
				for (const channel of locationChannels.values()) {
					await (channel as GuildChannel).permissionOverwrites.edit(
						interaction.guild.id,
						{
							SendMessages: false
						}
					)
				}
				await database.location.updateMany({
					where: {},
					data: {
						channel: null
					}
				})
				await database.player.updateMany({
					where: {},
					data: {
						locationId: null
					}
				})
				return interaction.editReply({
					content: "Channels successfully closed."
				})
			}
			case "item": {
				const location = await database.location.findFirst({
					where: {
						name
					}
				})
				if (!location) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Location not found",
							description: `The location ${name} was not found in the database.`
						})
					)
				}
				const item = await database.item.findFirst({
					where: {
						name: interaction.options.getString("item") || ""
					}
				})
				if (!item) {
					return interaction.editReply(
						generateErrorMessage({
							title: "Item not found",
							description: `The item ${interaction.options.getString("item") || ""} was not found in the database.`
						})
					)
				}
				await database.location.update({
					where: {
						id: location.id
					},
					data: {
						requiredItemName: item.name
					}
				})
				return interaction.editReply({
					content: `Location ${location.name} now requires players to have ${item.name}.`
				})
			}
			default:
				break
		}
	}
}
