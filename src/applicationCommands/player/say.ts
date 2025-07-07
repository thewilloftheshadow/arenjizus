import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ChannelType,
	type ChatInputCommandInteraction,
	ComponentType
} from "discord.js"
import { getDiscordPlayer } from "~/database/getData"
import { generateErrorMessage } from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"

const AVATAR_BASE_URL = "https://cdn.shadowing.dev/avatars/"

export default class Say extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("say", client, {
			description: `Say something as your player`,
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
					description: "The channel to send it in",
					channelTypes: [ChannelType.GuildText]
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

		const player = await getDiscordPlayer(interaction.user.id)
		if (!player || !player.webhookName || !player.webhookAvatar) {
			return interaction.editReply(
				generateErrorMessage({
					title: "No player profile",
					description: `You must set your name and avatar with /set before using this command.`
				})
			)
		}

		const avatarURL = `${AVATAR_BASE_URL}${encodeURIComponent(player.webhookAvatar)}`

		const hooks = await channel.fetchWebhooks()
		let hook = hooks.find((x) => x.owner?.id === this.client.user?.id)
		if (!hook) {
			hook = await channel.createWebhook({ name: "Arenjizus" })
		}

		const msg = await hook.send({
			content: text,
			username: player.webhookName,
			avatarURL,
			allowedMentions: {}
		})

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
