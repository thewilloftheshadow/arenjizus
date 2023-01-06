/* eslint-disable no-restricted-syntax */
import { CommandInteraction, MessageAttachment } from "discord.js"
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
        for await (const chan of channels.values()) {
            if (chan.isText()) {
                const channelMessages = await chan.messages.fetch()
                for await (const msg of channelMessages.values()) {
                    messages.push({
                        time: msg.createdAt,
                        id: msg.id,
                        author: msg.author ? msg.author.tag : "Unknown",
                        content: msg.content.replace(
                            `
`,
                            " "
                        ),
                        channel: chan.name,
                    })
                }
            }
        }
        const sortedMessages = messages.sort((a, b) => a.time.getTime() - b.time.getTime())
        // eslint-disable-next-line no-tabs
        const formatted = sortedMessages.map((msg) => `${msg.time.toISOString()}^^${msg.author}^^#${msg.channel}^^${msg.content}`)
        const attachment = new MessageAttachment(Buffer.from(formatted.join("\n"), "utf-8"), "messages.csv")
        this.client.logger.info(sortedMessages)
        return interaction.editReply({ files: [attachment] })
    }
}
