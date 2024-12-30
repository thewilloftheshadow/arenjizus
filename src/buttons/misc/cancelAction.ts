import type { ButtonInteraction } from "discord.js"
import { type BetterClient, Button } from "~/lib"

export default class Buttony extends Button {
	constructor(client: BetterClient) {
		super("cancelAction", client, {
			authorOnly: true
		})
	}

	override async run(interaction: ButtonInteraction) {
		await interaction.deferUpdate()
		const msg = interaction.message
		msg.edit({
			content: "Action cancelled.",
			embeds: [],
			components: [],
			attachments: []
		})
	}
}
