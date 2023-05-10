import { ChatInputCommandInteraction, TextChannel } from "discord.js"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"
import { getAllPlayers } from "@internal/database"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("askeveryone", client, {
			description: `Ask everyone something, Office cutaway style`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "question",
					description: "The question to ask",
					required: true,
				},
			],
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply(`Sending...`)
		if (!interaction.guild) return
		const players = await getAllPlayers()

		players.forEach((x) => {
			const user = x.discordId
			if (!user) return
			const name = x.name.replace(/ /g, "-").toLowerCase()
			const theirChannel = interaction.guild?.channels.cache.find((c) => c.name === `gm-${name}`)
			if (!theirChannel) {
				interaction.followUp(`Couldn't find channel for ${x.name} (${user})!`)
			} else {
				const sendChannel = theirChannel as TextChannel
				sendChannel.send({ content: `<@${user}>\n${interaction.options.getString("question", true)}`, allowedMentions: { users: [user] } })
			}
		})
	}
}
