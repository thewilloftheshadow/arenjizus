import { ApplicationCommand } from "@buape/lib"
import { BetterClient } from "@buape/lib"
import database, { getAllPlayers } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { logger } from "@internal/logger"
import {
	ApplicationCommandOptionType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	TextBasedChannel
} from "discord.js"

export default class Vote extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("vote", client, {
			description: `Vote for a player`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The player you want to vote for",
					required: true,
					autocomplete: true
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	) {
		switch (option.name) {
			case "name": {
				const allPlayers = await getAllPlayers()
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
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const enabled = await database.keyV.findFirst({
			where: {
				key: "voteEnabled"
			}
		})
		if (!enabled?.valueBoolean) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Voting is disabled",
					description: "It is not currently time to vote."
				})
			)
		}
		const player = await database.player.findFirst({
			where: {
				discordId: interaction.user.id
			}
		})
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
		const playerChosen = await database.player.findFirst({
			where: {
				name: interaction.options.getString("name", true)
			}
		})
		if (!playerChosen) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Player not found",
					description: "The player you specified could not be found."
				})
			)
		}
		await database.player.update({
			where: {
				name: player.name
			},
			data: {
				votedFor: {
					connect: {
						name: playerChosen.name
					}
				}
			}
		})

		const dayChat = await database.keyV.findFirst({
			where: {
				key: "dayChat"
			}
		})
		if (dayChat?.value) {
			const channel = this.client.channels.resolve(
				dayChat.value
			) as TextBasedChannel
			const m = await channel
				.send(`${player.name} has voted for ${playerChosen.name}!`)
				.catch(() => {})
			m?.pin().catch(() => {})
		}

		logger.gameLog(
			`${player.name} has voted for ${playerChosen.name} (worth ${player.voteWorth} votes)!`
		)

		return interaction.editReply({ content: `Success!` })
	}
}
