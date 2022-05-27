import { AutocompleteInteraction } from "discord.js"
import AutoComplete from "../../../../lib/classes/AutoComplete"
import TuskClient from "../../../../lib/extensions/TuskClient"

export default class Item extends AutoComplete {
    constructor(client: TuskClient) {
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

        this.client.logger.debug(allItems)

        if (name) {
            const items = allItems.filter((item: { name: string }) => item.name.toLowerCase().includes(name.toLowerCase()))
            return interaction.respond(items.map((item: { name: string }) => ({ name: item.name, value: item.name })))
        }
        this.client.logger.debug("No name")
        return interaction.respond(allItems.map((item: { name: string }) => ({ name: item.name, value: item.name })))
    }
}
