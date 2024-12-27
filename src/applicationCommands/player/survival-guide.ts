import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction
} from "discord.js"

export default class Vote extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("survival-guide", client, {
			description: `View the survival guide`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		interaction.reply({
			content: "** **",
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setURL(
							`https://docs.google.com/document/d/1O7PY2FBlrgPqoq9x2lyGLUIX7WX9xJ9qM0PBuxf3e_4/edit`
						)
						.setLabel("View Survival Guide")
						.setStyle(ButtonStyle.Link)
				)
			]
		})
	}
}
