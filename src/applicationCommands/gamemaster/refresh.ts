import type { ChatInputCommandInteraction } from "discord.js"
import { playerListUpdate } from "~/database/thingys"
import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("refresh", client, {
			description: `Refresh the player list if it failed to update`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		await playerListUpdate(this.client)
		return interaction.editReply({
			content: "Done"
		})
	}
}
