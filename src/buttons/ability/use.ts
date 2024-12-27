import { type BetterClient, Button } from "~/lib"
import { serverIds } from "~/config"
import database from "~/database"
import { logger } from "~/logger"
import type { ButtonInteraction } from "discord.js"
import { useAbility, runAbilityProperties } from "~/database/thingys"

export default class Buttony extends Button {
	constructor(client: BetterClient) {
		super("use", client, {})
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

		await useAbility(playerAbility.playerName, playerAbility.abilityName)
		const done = await runAbilityProperties(
			playerAbility.ability,
			"",
			this.client
		)
		await interaction.editReply(`Done\n${done ? done.join("\n") : ""}`)
		logger.gameLog(
			`${playerAbility.playerName} used ${playerAbility.abilityName}.`
		)
		await interaction.followUp({
			content: `<@${playerAbility.player.discordId}>, you used ${playerAbility.abilityName}.`
		})
		await interaction.message.edit({
			components: []
		})
	}
}
