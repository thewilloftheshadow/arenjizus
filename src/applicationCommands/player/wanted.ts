import {
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type TextChannel
} from "discord.js"
import database from "~/database"
import { getAllPlayers, getDiscordPlayer, getPlayer } from "~/database/getData"
import { removeMoney } from "~/database/thingys"
import { generateErrorMessage } from "~/functions/generateMessage"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

export default class Want extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("wanted", client, {
			description: `Mark a player as wanted`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The player you want to mark as wanted",
					required: true,
					autocomplete: true
				}
			]
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true)
		if (focusedOption.name !== "name") return
		const players = await getAllPlayers()
		const choices = players.map((player) => ({
			name: player.name,
			value: player.name
		}))
		if (focusedOption.value) {
			await interaction.respond(
				choices.filter((choice) =>
					choice.name.toLowerCase().includes(focusedOption.value.toLowerCase())
				)
			)
			return
		}
		await interaction.respond(choices)
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const enabled = await database.keyV.findFirst({
			where: {
				key: "canVote"
			}
		})
		if (!enabled?.valueBoolean) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Disabled",
					description: "It is not currently time to mark players as wanted."
				})
			)
		}
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

		const currentPriceData = await database.keyV.findFirst({
			where: {
				key: "wantedPrice"
			}
		})
		const wantedPrice = currentPriceData?.valueInt || 0

		const playerChosen = await getPlayer(
			interaction.options.getString("name", true)
		)
		if (!playerChosen) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Player not found",
					description: "The player you specified could not be found."
				})
			)
		}

		if (player.money < wantedPrice) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Not enough money",
					description: `You do not have enough money to mark ${playerChosen.name} as wanted. You need $${wantedPrice}, but you only have $${player.money}.`
				})
			)
		}

		await removeMoney(player.name, wantedPrice)

		const newPrice = wantedPrice + 5

		const dayChat = await database.keyV.findFirst({
			where: {
				key: "dayChat"
			}
		})
		if (dayChat?.value) {
			const channel = this.client.channels.resolve(dayChat.value) as TextChannel
			await channel
				.send(
					` <a:siren:1084362013247033405> Someone has declared ${playerChosen.name} as wanted! <a:siren:1084362013247033405>\nIt now costs $${newPrice} to declare someone wanted!`
				)
				.catch(() => {})
			channel
				.setTopic(
					`Wanted: ${playerChosen.name} | Price to change: $${newPrice}`
				)
				.catch(() => {})
		}

		await database.keyV.upsert({
			where: {
				key: "wantedPrice"
			},
			update: {
				valueInt: newPrice
			},
			create: {
				key: "wantedPrice",
				valueInt: newPrice
			}
		})

		// Store the wanted player's name in KeyV
		await database.keyV.upsert({
			where: {
				key: "wantedPlayer"
			},
			update: {
				value: playerChosen.name
			},
			create: {
				key: "wantedPlayer",
				value: playerChosen.name
			}
		})

		logger.gameLog(
			`${player.name} has declared ${playerChosen.name} as wanted for ${wantedPrice}!`
		)

		return interaction.editReply({ content: `Success!` })
	}
}
