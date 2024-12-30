import type { StringSelectMenuInteraction } from "discord.js"
import { serverIds } from "~/config"
import database from "~/database"
import { runAbilityProperties, useAbility } from "~/database/thingys"
import { getPlayerChannel } from "~/functions/player"
import { type BetterClient, Dropdown } from "~/lib"
import { logger } from "~/logger"

export default class Droppy extends Dropdown {
	constructor(client: BetterClient) {
		super("use", client, {})
	}

	override async run(interaction: StringSelectMenuInteraction) {
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
		if (!playerAbility)
			return interaction.editReply("Ability queue entry not found.")

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
		const playerChannel = await getPlayerChannel(
			playerAbility.playerName,
			this.client
		)
		if (!playerChannel) return
		await playerChannel.send({
			content: `<@${playerAbility.player.discordId}>, you used ${playerAbility.abilityName}.`
		})
	}
}
