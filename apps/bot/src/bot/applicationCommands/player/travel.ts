import { ApplicationCommand, BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import database, {
	getAllLocations,
	getDiscordPlayer,
	getLocation
} from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { logger } from "@internal/logger"
import {
	ApplicationCommandOptionType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChannelType,
	ChatInputCommandInteraction
} from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("travel", client, {
			description: `Travel to a new location`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "to",
					description: "The location you want to travel to",
					required: true,
					autocomplete: true
				}
			]
		})
	}
	override async autocomplete(
		interaction: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		const locations = await getAllLocations()
		switch (option.name) {
			case "to":
				return interaction.respond(
					locations
						.filter((x) =>
							option.value ? x.name.includes(option.value) : true
						)
						.map((location) => ({
							name: location.name,
							value: location.name
						}))
				)
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })

		const player = await getDiscordPlayer(interaction.user.id)
		if (!player || !player.discordId) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Player not linked",
						description:
							"The gamemasters have not yet linked any player data to your Discord account. Please contact them to do so."
					},
					false,
					true
				)
			)
		}

		const locationName = interaction.options.getString("to", true)
		const location = await getLocation(locationName)
		if (!location) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Location not found",
						description: `The location ${locationName} was not found.`
					},
					false,
					true
				)
			)
		}
		if (location.maxPlayers && location.players.length >= location.maxPlayers) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Location full",
						description: `The location ${locationName} is full.`
					},
					false,
					true
				)
			)
		}

		const votingEnabled = await database.keyV.upsert({
			where: { key: "voteEnabled" },
			create: { key: "voteEnabled", valueBoolean: false },
			update: {}
		})
		if (!votingEnabled.valueBoolean) {
			if (player.teleports <= 0) {
				return interaction.editReply(
					generateErrorMessage(
						{
							title: "No Teleports Left",
							description: `You have no teleports left.`
						},
						false,
						true
					)
				)
			}
			const chanId = location.channel
			const channel = chanId
				? await interaction.guild?.channels.fetch(chanId)
				: undefined
			if (
				!channel ||
				!channel.guild ||
				!channel.isTextBased() ||
				channel.type !== ChannelType.GuildText
			) {
				return interaction.editReply(
					generateErrorMessage(
						{
							title: "Location not found",
							description: `The location ${locationName} was not found.`
						},
						false,
						true
					)
				)
			}
			const oldChannel = player.location?.channel
				? await interaction.guild?.channels.fetch(player.location.channel)
				: undefined
			if (
				oldChannel?.guild &&
				oldChannel?.isTextBased() &&
				oldChannel?.type === ChannelType.GuildText
			) {
				await oldChannel.permissionOverwrites.delete(player.discordId)
			}
			channel.permissionOverwrites
				.create(player.discordId, {
					ViewChannel: true
				})
				.catch(() => {
					logger.gameLog(
						`Failed to give ${player.name} access to ${channel.name} <@&${serverIds.roles.gamemaster}>`
					)
				})
			await database.player.update({
				where: { id: player.id },
				data: {
					location: { connect: { id: location.id } },
					teleports: { decrement: 1 }
				}
			})
			logger.gameLog(`${player.name} teleported to ${location.name}`)

			return interaction.editReply(`You have teleported to ${location.name}`)
		}

		await database.player.update({
			where: { id: player.id },
			data: { location: { connect: { id: location.id } } }
		})

		logger.gameLog(`${player.name} will now travel to ${location.name}`)
		return interaction.editReply(`You will now travel to ${location.name}`)
	}
}
