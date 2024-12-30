import type { ChatInputCommandInteraction } from "discord.js"
import database, { kiai } from "~/database"
import { getDiscordPlayer } from "~/database/getData"
import {
	generateErrorMessage,
	generateSuccessMessage
} from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"
import { logger } from "~/logger"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("claim", client, {
			description: `Claim your $10 from Kiai`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (!interaction.inGuild()) return
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
		const kiaiLevel = await kiai.leveling.getMember(
			interaction.guildId,
			player.discordId
		)

		if (kiaiLevel.currentLevel > player.lastKiaiLevel) {
			await database.player.update({
				where: {
					id: player.id
				},
				data: {
					lastKiaiLevel: kiaiLevel.currentLevel,
					money: {
						increment: 10
					}
				}
			})
			logger.gameLog(
				`${player.name} claimed $10 from Kiai for level ${kiaiLevel.currentLevel}`
			)
			return interaction.editReply(
				generateSuccessMessage({
					title: "Claimed $10",
					description: `You have claimed your $10 from Kiai for reaching level ${kiaiLevel.currentLevel}!`
				})
			)
		}
		logger.gameLog(
			`${player.name} tried to claim $10 from Kiai but did not actually level up (last checked level was ${player.lastKiaiLevel}, Kiai reported ${kiaiLevel.currentLevel})`
		)
		return interaction.editReply(
			generateErrorMessage(
				{
					title: "Already claimed",
					description:
						"You have already claimed your $10 from Kiai. Stop trying to scam poor bots out of their money >:(\n||If you did level up, try running this again in a couple minutes||"
				},
				false,
				true
			)
		)
	}
}
