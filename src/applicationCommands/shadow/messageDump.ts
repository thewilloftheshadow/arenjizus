import {
	ApplicationCommandOptionType,
	AttachmentBuilder,
	ChannelType,
	type ChatInputCommandInteraction,
	type GuildChannel
} from "discord.js"
import { ApplicationCommand, type BetterClient } from "~/lib"

type MessageStored = {
	time: Date
	id: string
	author: string
	content: string
	channel: string
}

export default class MessageDump extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("messagedump", client, {
			description: `Dump the server`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "length",
					description: "The length of the dump",
					required: false,
					choices: [
						{
							name: "All",
							value: "all"
						},

						{
							name: "One Day",
							value: "day"
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Channel,
					name: "channel",
					description: "The channel to dump",
					required: false,
					channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText]
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply("Dumping messages...")
		if (!interaction.guild) return
		const dayFilter =
			interaction.options.getString("length") === "day"
				? new Date(Date.now() - 24 * 60 * 60 * 1000)
				: null

		const channelFilter = interaction.options.getChannel("channel")

		const channels = channelFilter
			? [await interaction.guild.channels.fetch(channelFilter.id)]
			: await interaction.guild.channels.fetch()
		const messages: MessageStored[] = []

		const blacklisted = [
			"best-of-v4",
			"best-of-v3",
			"best-of-v2",
			"best-of",
			"status-tracker",
			"discord-log",
			"welcome",
			"about-the-game",
			"bot-spam",
			"rwlboard",
			"xp-logs",
			"commands"
		]

		for await (const chan of channels.values()) {
			if (chan?.isTextBased() && !blacklisted.includes(chan.name)) {
				let lastID: string | undefined
				while (true) {
					const channelMessages = await chan.messages.fetch({
						limit: 100,
						...(lastID && { before: lastID })
					})

					for await (const msg of channelMessages.values()) {
						// Skip messages older than 24 hours if day filter is active
						if (dayFilter && msg.createdAt < dayFilter) {
							break
						}

						let content = msg.content.replace(/\n/g, " ")
						for (const user of msg.mentions.users.values()) {
							content = content.split(`<@${user.id}>`).join(`@${user.tag}`)
						}
						for (const role of msg.mentions.roles.values()) {
							content = content.split(`<@&${role.id}>`).join(`@${role.name}`)
						}
						for (const channel of msg.mentions.channels.values()) {
							const channell = channel as GuildChannel
							content = content
								.split(`<#${channel.id}>`)
								.join(`#${channell.name}`)
						}
						if (msg.mentions.repliedUser) {
							content = `Replying to ${msg.mentions.repliedUser.tag}: ${content}`
						}
						messages.push({
							time: msg.createdAt,
							id: msg.id,
							author: msg.author ? msg.author.tag : "Unknown",
							content,
							channel: chan.name
						})
					}

					// Break the channel loop if we hit messages older than 24 hours
					if (
						channelMessages.size === 0 ||
						(dayFilter &&
							channelMessages.last()?.createdAt &&
							channelMessages.last()!.createdAt < dayFilter)
					)
						break
					lastID = channelMessages.last()?.id
				}
			}
		}
		const sortedMessages = messages.sort(
			(a, b) => a.time.getTime() - b.time.getTime()
		)
		const formatted = sortedMessages.map(
			(msg) =>
				`${msg.time.toISOString()}	${msg.author}	#${msg.channel}	${
					msg.content || "No content"
				}`
		)
		const attachment = new AttachmentBuilder(
			Buffer.from(formatted.join("\n"), "utf-8"),
			{ name: "messages.tsv" }
		)
		return interaction.followUp({
			content: `<@${interaction.user.id}>`,
			files: [attachment]
		})
	}
}
