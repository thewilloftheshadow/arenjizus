import {
	ApplicationCommandOptionType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction
} from "discord.js"
import database from "~/database"
import { getAllPlayers } from "~/database/getData"
import { addMoney, removeMoney } from "~/database/thingys"
import { generateErrorMessage } from "~/functions/generateMessage"
import { getPlayerChannel } from "~/functions/player"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

export default class Send extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("send", client, {
			description: `Send money to someone`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The player you want to send money to",
					required: true,
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: "amount",
					description: "The amount of money to send",
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "reason",
					description: "The reason for the transaction",
					required: true
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
				const allOptions = allPlayers.map((player: { name: string }) => ({
					name: player.name,
					value: player.name
				}))
				allPlayers.map((x) => {
					if (x.alias)
						allOptions.push({
							name: x.alias,
							value: x.alias
						})
				})
				if (option.value) {
					const players = allOptions.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(players).catch(() => {})
				}
				return interaction.respond(allOptions).catch(() => {})
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const enabled = await database.keyV.findFirst({
			where: {
				key: "canSend"
			}
		})
		if (!enabled?.valueBoolean) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Sending money is disabled",
					description: "It is not currently time to send money."
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
		let playerChosen = await database.player.findFirst({
			where: {
				name: interaction.options.getString("name", true)
			}
		})
		let isAlias = false
		if (!playerChosen) {
			playerChosen = await database.player.findFirst({
				where: {
					alias: interaction.options.getString("name", true)
				}
			})
			isAlias = true
		}
		if (!playerChosen) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Player not found",
					description: "The player you specified could not be found."
				})
			)
		}

		const amount = interaction.options.getInteger("amount", true)
		if (amount <= 0) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Invalid amount",
					description: "The amount must be greater than 0."
				})
			)
		}
		if (amount > player.money) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Insufficient funds",
					description: "You do not have enough money to send."
				})
			)
		}
		const reason = interaction.options.getString("reason")
		await removeMoney(player.name, amount)
		await addMoney(playerChosen.name, amount)

		logger.gameLog(
			`${player.name} has sent $${amount} to ${playerChosen.name}${isAlias ? ` (via ${playerChosen.alias})` : ""}${reason ? `: ${reason}` : ""}.`
		)

		const playerChannel = await getPlayerChannel(playerChosen.name, this.client)
		if (playerChannel) {
			playerChannel.send(
				`You have received $${amount} from ${player.name}${isAlias ? ` via ${playerChosen.alias}` : ""}${reason ? `: ${reason}` : ""}.`
			)
		}

		return interaction.editReply({ content: `Success!` })
	}
}
