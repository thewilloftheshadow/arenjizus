import { CommandInteraction } from "discord.js"
import shuffle from "shuffle-array"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("shuffle", client, {
            description: `Shuffle a list of items`,
            options: [
                {
                    type: "STRING",
                    name: "items",
                    description: "The items to shuffle, separated by commas",
                    required: true,
                }
            ]
        })
    }

    override async run(interaction: CommandInteraction) {
        const items = interaction.options.getString("items", true)
        const itemList = items.split(",")
        const shuffledItems = shuffle(itemList)
        const shuffledItemsString = shuffledItems.join(", ")
        await interaction.reply(`${shuffledItemsString}`)
    }
}
