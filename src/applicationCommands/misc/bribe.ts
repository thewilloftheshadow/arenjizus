import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Command extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("bribe", client, {
			description: ":D",
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "seven",
					description: ":D"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "shadow",
					description: ";)"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "turkey",
					description: "(:"
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		const person = interaction.options.getSubcommand(true)
		if (!person) return
		const id =
			person === "seven"
				? "960888903764676618"
				: person === "turkey"
					? "389840562112561183"
					: "439223656200273932"
		const link =
			person === "seven"
				? "https://ko-fi.com/seventhheart"
				: person === "turkey"
					? "https://ko-fi.com/turkeywizard"
					: "https://ko-fi.com/theshadow"
		const gif =
			person === "seven"
				? "https://tenor.com/bCqtn.gif"
				: person === "turkey"
					? "https://tenor.com/U4fh.gif"
					: "https://tenor.com/bCqtn.gif"
		return interaction.reply({
			content: `## Bribe <@${id}> by clicking the button below!\n\n-# ${gif}`,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setURL(link)
						.setLabel("Bribe")
						.setStyle(ButtonStyle.Link)
				)
			]
		})
	}
}
