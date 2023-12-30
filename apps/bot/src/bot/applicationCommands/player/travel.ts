import { ApplicationCommand, BetterClient } from "@buape/lib"
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
		switch (option.name) {
			case "to":
				if (option.value) {
					const locations = await getAllLocations()
					return interaction.respond(
						locations
							.filter((x) => x.name.includes(option.value))
							.map((location) => ({
								name: location.name,
								value: location.name
							}))
					)
				}
				break
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })

		const player = await getDiscordPlayer(interaction.user.id)
		if (!player) {
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

		await database.player.update({
			where: { id: player.id },
			data: { location: { connect: { id: location.id } } }
		})

		logger.gameLog(`${player.name} will now travel to ${location.name}`)
		return interaction.editReply(`You will now travel to ${location.name}`)
	}
}
