/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { CommandInteraction, GuildChannel, MessageAttachment } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

type MessageStored = {
    time: Date
    id: string
    author: string
    content: string
    channel: string
}

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("messagedump", client, {
            description: `Dump the server`,
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        if (!interaction.guild) return
        const channels = await interaction.guild.channels.fetch()
        const messages: MessageStored[] = []

        const blacklisted = ["highlights", "status-tracker", "discord-log", "welcome", "about-the-game", "bot-spam", "rwlboard"]

        for await (const chan of channels.values()) {
            if (chan.isText() && !blacklisted.includes(chan.name)) {
                let lastID: string | undefined
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const channelMessages = await chan.messages.fetch({ limit: 100, ...(lastID && { before: lastID }) })
                    for await (const msg of channelMessages.values()) {
                        let content = msg.content.replace(/\n/g, " ")
                        msg.mentions.users.forEach((user) => {
                            content = content.split(`<@${user.id}>`).join(`@${user.tag}`)
                        })
                        msg.mentions.roles.forEach((role) => {
                            content = content.split(`<@&${role.id}>`).join(`@${role.name}`)
                        })
                        msg.mentions.channels.forEach((channel) => {
                            const channell = channel as GuildChannel
                            content = content.split(`<#${channel.id}>`).join(`#${channell.name}`)
                        })
                        if (msg.mentions.repliedUser) {
                            content = `Replying to ${msg.mentions.repliedUser.tag}: ${content}`
                        }
                        messages.push({
                            time: msg.createdAt,
                            id: msg.id,
                            author: msg.author ? msg.author.tag : "Unknown",
                            content: msg.content.replace(/\n/g, " "),
                            channel: chan.name,
                        })
                    }
                    if (channelMessages.size === 0) break
                    lastID = channelMessages.last()?.id
                }
            }
        }
        const sortedMessages = messages.sort((a, b) => a.time.getTime() - b.time.getTime())
        // eslint-disable-next-line no-tabs
        const formatted = sortedMessages.map((msg) => `${msg.time.toISOString()}	${msg.author}	#${msg.channel}	${msg.content || "No content"}`)
        const attachment = new MessageAttachment(Buffer.from(formatted.join("\n"), "utf-8"), "messages.tsv")
        this.client.logger.info(sortedMessages)
        return interaction.editReply({ files: [attachment] })
    }
}
