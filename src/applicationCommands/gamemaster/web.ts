import type { ChatInputCommandInteraction } from "discord.js"
import { admins } from "~/config"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Web extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("web", client, {
			description: `See the web interface`,
			options: []
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (!admins.includes(interaction.user.id)) {
			interaction.reply({
				content: `You can't even use this anyway`,
				ephemeral: true
			})
			return
		}
		interaction.reply({
			content: `https://amx.willshadow.com`,
			ephemeral: true
		})
	}
}
