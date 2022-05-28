import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("log", client, {
            description: `Add an entry to the game log`,
            options: [
                {
                    type: "STRING",
                    name: "entry",
                    description: "The entry to add",
                    required: true,
                }
            ]
        })
    }

    override async run(interaction: CommandInteraction) {
        const entry = interaction.options.getString("entry", true)
        this.client.logger.gameLog(entry)
        interaction.reply({ content: `Added to the game log`, ephemeral: true })
    }
}
