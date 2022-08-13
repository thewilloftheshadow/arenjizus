import { Message, TextChannel } from "discord.js"
import TextCommand from "../../../../lib/classes/TextCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Eval extends TextCommand {
    constructor(client: BetterClient) {
        super("reset", client, {
            description: "Evaluates arbitrary JavaScript code.",
            devOnly: true,
        })
    }

    override async run(message: Message) {
        if (!message.channel.isText()) return message.reply("This command can only be used in text channels.")
        const channel = message.channel as TextChannel
        if (channel.name !== "reset") return message.reply("This command can only be used in a channel called \"reset\" for safety reasons.")
        this.client.prisma.player.updateMany({
            data: {
                deathStatus: "ALIVE",
            },
        })
        message.reply("Everyone is now alive")
    }
}
