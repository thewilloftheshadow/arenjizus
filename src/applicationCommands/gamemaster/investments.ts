import { generateTimestamp } from "@buape/functions"
import type { ChatInputCommandInteraction } from "discord.js"
import database from "~/database"
import { generateSuccessMessage } from "~/functions/generateMessage"
import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("investments", client, {
			description: `View pending investments`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const investments = await database.investment.findMany()
		interaction.reply(
			generateSuccessMessage({
				title: "Pending Investments",
				description: `There are currently ${investments.length} pending investments.\n\n${investments
					.map((x) => {
						return `- **${x.playerName}** invested $${x.amount}, expires at ${generateTimestamp({ timestamp: x.expiresAt, type: "T" })} (${generateTimestamp({ timestamp: x.expiresAt, type: "R" })})`
					})
					.join("\n")}`
			})
		)
	}
}
