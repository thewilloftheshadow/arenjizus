import { AutocompleteInteraction } from "discord.js"
import AutoComplete from "../../../../lib/classes/AutoComplete"
import BlobbyClient from "../../../../lib/extensions/BlobbyClient"

export default class Player extends AutoComplete {
    constructor(client: BlobbyClient) {
        super("player-name", client)
    }

    override async run(interaction: AutocompleteInteraction) {
        const name = interaction.options.getString("name")
        this.client.logger.debug(name)

        const allPlayers = await this.client.prisma.player.findMany({
            select: {
                name: true,
            },
        })

        this.client.logger.debug(allPlayers)

        if (name) {
            const players = allPlayers.filter((player: { name: string }) => player.name.toLowerCase().includes(name.toLowerCase()))
            return interaction.respond(players.map((player: { name: string }) => ({ name: player.name, value: player.name })))
        }
        this.client.logger.debug("No name")
        return interaction.respond(allPlayers.map((player: { name: string }) => ({ name: player.name, value: player.name })))
    }
}
