import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import { getAllPlayers } from "~/database/getData"
import type {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	TextChannel
} from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("askeveryone", client, {
			description: `Ask everyone something, Office cutaway style`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "question",
					description: "The question to ask",
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "only-user",
					description: "Only ask one user",
					required: false,
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "ping",
					description: "Ping the user",
					required: false
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	) {
		const allPlayers = await getAllPlayers()
		switch (option.name) {
			case "only-user":
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(
						players.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
				}
				return interaction.respond(
					allPlayers.map((player: { name: string }) => ({
						name: player.name,
						value: player.name
					}))
				)
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: `Sending...`, ephemeral: true })
		if (!interaction.guild) return
		const players = await getAllPlayers()

		let ping = interaction.options.getBoolean("ping", false)
		if (ping === null) ping = true

		for (const x of players) {
			if (
				interaction.options.getString("only-user") &&
				interaction.options.getString("only-user") !== x.name
			)
				continue
			const user = x.discordId
			if (!user) return
			const name = x.name.replace(/ /g, "-").toLowerCase()
			const message = interaction.options
				.getString("question", true)
				.replace(/;;/g, "\n")
			const theirChannel = interaction.guild?.channels.cache.find(
				(c) => c.name === `gm-${name.toLowerCase().replace(/ /g, "-")}`
			)
			if (!theirChannel) {
				interaction.followUp(`Couldn't find channel for ${x.name} (${user})!`)
			} else {
				const sendChannel = theirChannel as TextChannel

				const hooks = await sendChannel.fetchWebhooks()
				let hook = hooks.find((x) => x.owner?.id === this.client.user?.id)
				if (!hook) {
					hook = await sendChannel.createWebhook({ name: "Arenjizus" })
				}

				hook.send({
					content: `${ping ? `<@${user}> ` : ""}${message}`,
					username: "The Newscaster",
					avatarURL:
						"https://thumbs.dreamstime.com/b/cheerful-interviewer-holding-microphone-gray-suit-looking-camera-isolated-white-background-60540771.jpg",
					allowedMentions: { users: [user] }
				})
			}
		}
	}
}
