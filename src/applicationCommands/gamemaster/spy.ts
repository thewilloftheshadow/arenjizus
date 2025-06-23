import {
	ApplicationCommandOptionType,
	ChannelType,
	type ChatInputCommandInteraction,
	type TextChannel
} from "discord.js"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"
import { logger } from "~/logger"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("spy", client, {
			description: `Send messages from one channel into another`,
			options: [
				{
					type: ApplicationCommandOptionType.Channel,
					name: "channel",
					description: "The channel to send from",
					required: true,
					channelTypes: [ChannelType.GuildText]
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: "amount",
					description:
						"The amount of messages to send (default is 5, max is 20)",
					required: false
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		if (!this.client.user || !interaction.channel) return
		const thisChannel = interaction.channel as TextChannel
		const channel = interaction.options.getChannel(
			"channel",
			true
		) as TextChannel
		const amount = interaction.options.getInteger("amount", false) || 5

		if (amount > 50)
			return interaction.editReply("You can only send 20 messages at a time")

		const raw = await channel.messages.fetch({ limit: 50 })

		const messages = raw
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first(amount)
			.reverse()

		const hooks = await thisChannel.fetchWebhooks()
		let hook = hooks.find((h) => h.owner?.id === this.client.user?.id)
		if (!hook)
			hook = await thisChannel.createWebhook({
				name: this.client.user.username,
				avatar: this.client.user.displayAvatarURL()
			})

		logger.gameLog(
			`Spying on <#${channel.id}> for ${amount} messages in <#${thisChannel}>`
		)

		thisChannel.send("*Beginning transmission...*")

		for await (const message of messages) {
			await sleep(3000)
			await hook.send({
				content: message.content || "** **",
				embeds: message.embeds.map((x) => x),
				username: message.author.username,
				avatarURL: message.author.displayAvatarURL()
			})
		}

		thisChannel.send("*End of transmission...*")

		await interaction.editReply("Done!")
	}
}
