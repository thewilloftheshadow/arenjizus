import { Message } from "discord.js"
import EventHandler from "../../../lib/classes/EventHandler"

export default class MessageCreate extends EventHandler {
    override async run(message: Message) {
        if (message.author.bot) return
        this.client.textCommandHandler.handleCommand(message)
    }
}
