import type { ButtonInteraction } from "discord.js"
import { serverIds } from "~/config"
import database from "~/database"
import { runAbilityProperties, useAbility } from "~/database/thingys"
import { getPlayerChannel } from "~/functions/player"
import { type BetterClient, Button } from "~/lib"
import { logger } from "~/logger"

export default class Use extends Button {
	constructor(client: BetterClient) {
		super("use", client, {})
	}

	override async run(interaction: ButtonInteraction) {
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster)) return
		await interaction.deferUpdate()

		const [_, id] = interaction.customId.split(":")
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

		// biome-ignore lint/correctness/useHookAtTopLevel: this isnt a hook
		await useAbility(playerAbility.playerName, playerAbility.abilityName)
		const done = await runAbilityProperties(
			playerAbility.ability,
			"",
			this.client
		)
		logger.gameLog(
			`${playerAbility.playerName} used ${playerAbility.abilityName}.`
		)
		const channel = await getPlayerChannel(
			playerAbility.playerName,
			interaction.client
		)
		if (!channel || !channel.isSendable()) return
		await channel.send({
			content: `<@${playerAbility.player.discordId}>, you used ${playerAbility.abilityName}.`
		})
		await interaction.message
			.edit({
				components: [],
				content: `Done\n${done ? done.join("\n") : ""}`
			})
			.catch(() => {})
	}
}
