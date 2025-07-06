import type { ButtonInteraction } from "discord.js"
import { serverIds } from "~/config"
import database from "~/database"
import { type BetterClient, Button } from "~/lib"

export default class RejectUse extends Button {
	constructor(client: BetterClient) {
		super("rejectUse", client, {})
	}

	override async run(interaction: ButtonInteraction) {
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster)) return
		await interaction.deferUpdate()

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
			return interaction.editReply({
				content: "Ability queue entry not found.",
				components: []
			})
		if (playerAbility.ability.customOneOff && playerAbility.usesLeft !== 0) {
			await database.playerAbilities.update({
				where: {
					id
				},
				data: {
					usesLeft: 0
				}
			})
		}

		await database.playerAbilities.delete({
			where: {
				id
			}
		})

		interaction.editReply({
			content: "Ability use has been denied.",
			components: []
		})
	}
}
