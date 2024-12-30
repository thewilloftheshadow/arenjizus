import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChannelType,
	type ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"
import { generateErrorMessage } from "~/functions/generateMessage"
import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("say", client, {
			description: `Make me say something`,
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

		if (channel?.type !== ChannelType.GuildText) {
			return interaction.editReply(
				generateErrorMessage({
					title: "Invalid channel",
					description: `The channel you specified is not a text channel`
				})
			)
		}

		const msg = await channel.send(text)

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
