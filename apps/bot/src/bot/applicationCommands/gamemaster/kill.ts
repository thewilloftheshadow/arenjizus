import { ChatInputCommandInteraction } from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@buape/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@buape/lib"
import { Death, getPlayer, toggleDeath } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { serverIds } from "@internal/config"

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
					autocomplete: true,
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "fake",
					description: "Whether this death is faked (e.g. ketchup) or real",
				},
			],
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const name = interaction.options.getString("name", true)
		const fake = interaction.options.getBoolean("fake", false)
		const player = await getPlayer(name)
		if (!player) {
			return interaction.editReply(generateErrorMessage({ title: "Player not found", description: `Could not find player ${name}` }))
		}

		await toggleDeath(name, fake ? Death.FAKED : Death.DEAD)

		await logger.gameLog(`${name} has died${fake ? " (faked)" : ""}!`)
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
			content: "<:aukilling:762406290898288640><:aukilled:762406290952814632> 👻",
		})
	}
}
