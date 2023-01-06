/* eslint-disable no-restricted-syntax */
import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

type MessageStored = {
    time: Date
    id: string
    author: string
    content: string
}

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("messagedump", client, {
            description: `Dump the server`,
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
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
                        content: msg.content,
                    })
                }
            }
        }
        const sortedMessages = messages.sort((a, b) => a.time.getTime() - b.time.getTime())
        const haste = await this.client.functions.uploadHaste(JSON.stringify(sortedMessages, null, 4))
        return interaction.editReply({ content: `${haste}` })
    }
}
