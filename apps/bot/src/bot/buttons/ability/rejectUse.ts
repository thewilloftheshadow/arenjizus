import { type BetterClient, Button } from "@buape/lib"
import { serverIds } from "@internal/config"
import type { ButtonInteraction } from "discord.js"

export default class Buttony extends Button {
	constructor(client: BetterClient) {
		super("rejectUse", client, {})
	}

	override async run(interaction: ButtonInteraction) {
		await interaction.deferUpdate()
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster))
			return interaction.editReply("You are not a gamemaster.")

		await interaction.message.edit({
			components: []
		})

		interaction.followUp({
			content: "Ability use has been denied."
		})
	}
}
