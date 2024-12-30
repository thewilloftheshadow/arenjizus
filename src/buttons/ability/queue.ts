import { type BetterClient, Button } from "~/lib"
import { serverIds } from "~/config"
import database from "~/database"
import { logger } from "~/logger"
import type { ButtonInteraction } from "discord.js"
import { queueAbility } from "~/database/ability"

export default class Buttony extends Button {
	constructor(client: BetterClient) {
		super("queue", client, {})
	}

	override async run(interaction: ButtonInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster))
			return interaction.editReply("You are not a gamemaster.")

		const id = interaction.customId.split(":")[1]
		const playerAbility = await database.playerAbilities.findFirst({
			where: {
				id
			},
			include: {
				player: true,
				ability: true
			}
		})
		if (!playerAbility) return interaction.editReply("Ability not found.")

		await queueAbility(playerAbility.id)

		await interaction.editReply(`Ability added to queue.\n-# ||${playerAbility.abilityName}:${playerAbility.playerName}-${Date.now()}||`)
		logger.gameLog(
			`${playerAbility.abilityName} has been queued for ${playerAbility.playerName}.\n-# ||${playerAbility.abilityName}:${playerAbility.playerName}-${Date.now()}||`
		)
		await interaction.message.edit({
			content: `Ability added to queue.\n-# ||${playerAbility.abilityName}:${playerAbility.playerName}-${Date.now()}||`,
			components: []
		})
	}
}
