import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	type ChatInputCommandInteraction
} from "discord.js"
import { generateErrorMessage } from "~/functions/generateMessage"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Trenchcoat extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("trenchcoat", client, {
			description: `Yay trenchcoat`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "text",
					description: "The text to say",
					required: true
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: "channel",
					description: "The channel to send it in"
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const text = interaction.options.getString("text", true)
		const channel = await interaction.guild?.channels.fetch(
			interaction.options.getChannel("channel", false)?.id ||
				interaction.channelId
		)

		if (
			!channel ||
			!channel.isSendable() ||
			channel.type !== ChannelType.GuildText
		) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Invalid channel",
					description: `The channel you specified is not a text channel`
				})
			)
		}

		const hooks = await channel.fetchWebhooks()
		let hook = hooks.find((x) => x.owner?.id === this.client.user?.id)
		if (!hook) {
			hook = await channel.createWebhook({ name: "Arenjizus" })
		}

		const msg = await hook.send({
			content: `${text}`,
			username: "Trenchcoat",
			avatarURL:
				"https://cdnd.lystit.com/photos/2012/06/01/burberry-mercury-midlength-heritage-cotton-trench-coat-product-1-3824627-326438071.jpeg",
			allowedMentions: {}
		})

		return interaction.editReply({
			content: "Sent!",
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setURL(msg.url)
						.setLabel("View message")
						.setStyle(ButtonStyle.Link)
				)
			]
		})
	}
}
