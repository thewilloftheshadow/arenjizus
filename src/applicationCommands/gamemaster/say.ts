import {
	ApplicationCommandOptionType,
	ButtonStyle,
	type ChatInputCommandInteraction,
	ComponentType
} from "discord.js"
import { generateErrorMessage } from "~/functions/generateMessage"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("echo", client, {
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

		if (!channel || !channel.isSendable()) {
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
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: "View message",
							url: msg.url
						}
					]
				}
			]
		})
	}
}
