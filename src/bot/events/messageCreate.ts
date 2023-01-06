import { Message, TextChannel } from "discord.js"
import EventHandler from "../../../lib/classes/EventHandler"

export default class MessageCreate extends EventHandler {
    override async run(message: Message) {
        const letterHOnly = ""
        const gifOnly = ""

        if (message.author.id === gifOnly) {
            const channel = message.guild?.channels.resolve("1060715823574032405") as TextChannel
            channel.send({
                content: message.content ?? "Check:",
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                files: message.attachments.first() ? [message.attachments.first()!.url] : [],
            })
        }

        if (message.author.id === letterHOnly) {
            if (message.content.toLowerCase().includes("h")) {
                message.delete()
                message.member?.timeout(15000, "Letter H Drug")
            }
        }

        if (message.author.bot) return
        this.client.textCommandHandler.handleCommand(message)
    }
}
