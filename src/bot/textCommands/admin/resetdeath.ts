import { Message } from "discord.js"
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
        this.client.prisma.player.updateMany({
            data: {
                alive: "ALIVE",
            },
        })
        message.reply("Everyone is now alive")
    }
}
