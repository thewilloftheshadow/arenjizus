import { serverIds } from "@internal/config"
import database, { useAbility } from "@internal/database"
import { Button, BetterClient } from "@internal/lib"
import { logger } from "@internal/logger"
import { ButtonInteraction } from "discord.js"

export default class Buttony extends Button {
	constructor(client: BetterClient) {
		super("use", client, {})
	}

	override async run(interaction: ButtonInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster)) return interaction.editReply("You are not a gamemaster.")

		const id = interaction.customId.split(":")[1]
		const playerAbility = (
			await database.playerAbilities.findMany({
				where: {
					id,
				},
				include: {
					player: true,
				},
			})
		)[0]
		if (!playerAbility) return interaction.editReply("Ability not found.")

		const used = await useAbility(playerAbility.playerName, playerAbility.abilityName)
		if (used.isErr()) return interaction.editReply(used.unwrapErr())
		await interaction.editReply(`Done`)
		await logger.gameLog(`${playerAbility.playerName} used ${playerAbility.abilityName}.`)
		await interaction.followUp({
			content: `<@${playerAbility.player.discordId}>, you used ${playerAbility.abilityName}.`,
		})
		await interaction.message.edit({
			components: [],
		})
	}
}
