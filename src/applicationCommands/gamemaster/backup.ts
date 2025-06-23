import { copyFileSync } from "node:fs"
import type { ChatInputCommandInteraction } from "discord.js"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("backup", client, {
			description: `Take a backup of the current state of the db for future rollback`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		if (!import.meta.dir.startsWith("/home/ubuntu/arenjizus"))
			return interaction.editReply(
				"This command can only be used the production environment (yay jank code)"
			)
		const newName = `backup_${Date.now()}.db`
		copyFileSync(
			`/home/ubuntu/arenjizus/prisma/dev.db`,
			`/home/ubuntu/arenjizus/prisma/${newName}`
		)
		return interaction.editReply(
			`Backup created as ${newName}, contact Shadow to rollback`
		)
	}
}
