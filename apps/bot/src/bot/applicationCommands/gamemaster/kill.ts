import { ApplicationCommand } from "@buape/lib"
import { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import database, { Death, getPlayer, toggleDeath } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { logger } from "@internal/logger"
import { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("kill", client, {
			description: `Kill a player`,
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
					name: "fake",
					description: "Whether this death is faked (e.g. ketchup) or real"
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const name = interaction.options.getString("name", true)
		const fake = interaction.options.getBoolean("fake", false)
		const player = await getPlayer(name)
		if (!player) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Player not found",
					description: `Could not find player ${name}`
				})
			)
		}

		const bodyItem = await database.item.findFirst({
			where: {
				name: `${player.name}'s Body`
			}
		})
		if (!bodyItem) {
			await database.item.create({
				data: {
					name: `${player.name}'s Body`,
					price: 0,
					description: "The body of a dead player",
					players: {
						create: {
							playerName: player.name,
							amount: 1
						}
					}
				}
			})
			logger.gameLog(`A body has been generated for ${player.name}`)
		}

		await toggleDeath(name, fake ? Death.FAKED : Death.DEAD)

		logger.gameLog(`${name} has died${fake ? " (faked)" : ""}!`)
		if (player.discordId) {
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.remove(serverIds.roles.player)
				.catch(() => {})
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.add(serverIds.roles.dead)
				.catch(() => {})
		}

		return interaction.editReply({
			content: "<a:abearstab:1191103361118916698> 👻"
		})
	}
}
