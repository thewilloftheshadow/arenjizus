import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Bribe extends ApplicationCommand {
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

		interface User {
			link: string,
			gif: string,
			id: string
		}

		const users: Record<string, User> = {
			seven: {
				link: "https://ko-fi.com/seventhheart",
				gif: "https://tenor.com/bCqtn.gif",
				id: "960888903764676618"
			},
			turkey: {
				link: "https://ko-fi.com/turkeywizard",
				gif: "https://tenor.com/U4fh.gif",
				id: "389840562112561183"
			},
			shadow: {
				link: "https://ko-fi.com/theshadow",
				gif: "https://tenor.com/bCqtn.gif",
				id: "439223656200273932"
			}
		}

		return interaction.reply({
			content: `## Bribe <@${users[person].id}> by clicking the button below!\n\n-# ${users[person].gif}`,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setURL(users[person].link)
						.setLabel("Bribe")
						.setStyle(ButtonStyle.Link)
				)
			]
		})
	}
}
