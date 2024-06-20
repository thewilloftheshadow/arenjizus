import { ApplicationCommand, type BetterClient } from "@buape/lib"
import database, { getDiscordPlayer } from "@internal/database"
import { generateErrorMessage, generateTimestamp } from "@internal/functions"
import { logger } from "@internal/logger"
import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction
} from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("invest", client, {
			description: `Invest money, and receive double in 24 hours`,
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: "amount",
					description: "The amount to invest",
					required: true,
					minValue: 1,
					maxValue: 10000
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
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
		const amount = interaction.options.getInteger("amount", true)
		if (player.money < amount) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Not enough money",
					description: `You only have ${player.money} money`
				})
			)
		}
		await database.player.update({
			where: {
				id: player.id
			},
			data: {
				money: player.money - amount,
				investments: {
					create: {
						amount,
						createdAt: new Date(),
						expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
					}
				}
			}
		})
		logger.gameLog(
			`${player.name} invested $${amount}, ends ${generateTimestamp({
				timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24),
				type: "R"
			})}`
		)
		return interaction.editReply({
			content: `You have invested $${amount}, and will receive ${
				amount * 2
			} money ${generateTimestamp({
				timestamp: new Date(Date.now() + 1000 * 60 * 60 * 24),
				type: "R"
			})}`
		})
	}
}
