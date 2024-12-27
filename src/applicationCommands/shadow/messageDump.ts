import { ApplicationCommand, type BetterClient } from "~/lib"
import {
	AttachmentBuilder,
	type ChatInputCommandInteraction,
	type GuildChannel
} from "discord.js"

type MessageStored = {
	time: Date
	id: string
	author: string
	content: string
	channel: string
}

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("messagedump", client, {
			description: `Dump the server`,
			restriction: "gamemaster"
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		if (!interaction.guild) return
		const channels = await interaction.guild.channels.fetch()
		const messages: MessageStored[] = []

		const blacklisted = [
			"highlights",
			"status-tracker",
			"discord-log",
			"welcome",
			"about-the-game",
			"bot-spam",
			"rwlboard"
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
					if (channelMessages.size === 0) break
					lastID = channelMessages.last()?.id
				}
			}
		}
		const sortedMessages = messages.sort(
			(a, b) => a.time.getTime() - b.time.getTime()
		)
		const formatted = sortedMessages.map(
			(msg) =>
				`${msg.time.toISOString()}	${msg.author}	#${msg.channel}	${msg.content || "No content"
				}`
		)
		const attachment = new AttachmentBuilder(
			Buffer.from(formatted.join("\n"), "utf-8"),
			{ name: "messages.tsv" }
		)
		return interaction.editReply({ files: [attachment] })
	}
}
