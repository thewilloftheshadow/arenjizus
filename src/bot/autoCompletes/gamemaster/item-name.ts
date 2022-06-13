import { AutocompleteInteraction } from "discord.js"
import AutoComplete from "../../../../lib/classes/AutoComplete"
import BlobbyClient from "../../../../lib/extensions/BlobbyClient"

export default class Item extends AutoComplete {
    constructor(client: BlobbyClient) {
        super("item-name", client)
    }

    override async run(interaction: AutocompleteInteraction) {
        const name = interaction.options.getString("name")
        this.client.logger.debug(name)

        const allItems = await this.client.prisma.item.findMany({
            select: {
                name: true,
            },
        })

        if (name) {
            const items = allItems.filter((item: { name: string }) => item.name.toLowerCase().includes(name.toLowerCase()))
            return interaction.respond(items.map((item: { name: string }) => ({ name: item.name, value: item.name })))
        }
        return interaction.respond(allItems.map((item: { name: string }) => ({ name: item.name, value: item.name })))
    }
}
