import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import { serverIds } from "~/config"
import { logger } from "~/logger"
import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"
import { getPlayer } from "~/database/getData"
import { toggleDeath } from "~/database/thingys"
import { generateErrorMessage } from "~/functions/generateMessage"

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

		await toggleDeath(name, true)

		if (player.discordId) {
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.remove(serverIds.roles.dead)
				.catch(() => { })
			await interaction.guild?.members
				.resolve(player.discordId)
				?.roles.add(serverIds.roles.player)
				.catch(() => { })
		}

		logger.gameLog(`${name} has been resurrected!`)
		return interaction.editReply("<a:party_moogle:1192168660815593643>")
	}
}