import { ChatInputCommandInteraction } from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@buape/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import { toggleDeath, Death, getPlayer } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("resurrect", client, {
			description: `Resurrect a player`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name of the player",
					required: true,
					autocomplete: true
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const name = interaction.options.getString("name", true)
		const player = await getPlayer(name)
		if (!player) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Player not found",
					description: `Could not find player ${name}`
				})
			)
		}

		await toggleDeath(name, Death.ALIVE)

		if (player.discordId) {
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.remove(serverIds.roles.dead)
				.catch(() => {})
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.add(serverIds.roles.player)
				.catch(() => {})
		}

		logger.gameLog(`${name} has been resurrected!`)
		return interaction.editReply("<a:atada_big:543825795727228942>")
	}
}
