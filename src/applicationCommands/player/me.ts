import type { ChatInputCommandInteraction } from "discord.js"
import { playerEmbed } from "~/database/embeds"
import { getDiscordPlayer } from "~/database/getData"
import { generateErrorMessage } from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("me", client, {
			description: `See your own data`
		})
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
		return interaction.editReply({ embeds: [playerEmbed(player)] })
	}
}
