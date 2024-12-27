import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import type { ChatInputCommandInteraction } from "discord.js"
import { copyFileSync } from "node:fs"

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
			`/home/ubuntu/arenjizus/packages/database/prisma/dev.db`,
			`/home/ubuntu/arenjizus/packages/database/prisma/${newName}`
		)
		return interaction.editReply(
			`Backup created as ${newName}, contact Shadow to rollback`
		)
	}
}
