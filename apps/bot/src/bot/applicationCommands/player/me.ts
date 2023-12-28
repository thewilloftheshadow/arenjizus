import { ApplicationCommand, BetterClient } from "@buape/lib"
import { getDiscordPlayer, playerEmbed } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { ChatInputCommandInteraction } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("me", client, {
			description: `See your own data`,
			restriction: "player",
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
