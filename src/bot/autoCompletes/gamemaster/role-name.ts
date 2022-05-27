import { AutocompleteInteraction } from "discord.js"
import AutoComplete from "../../../../lib/classes/AutoComplete"
import BlobbyClient from "../../../../lib/extensions/BlobbyClient"

export default class Role extends AutoComplete {
    constructor(client: BlobbyClient) {
        super("role-name", client)
    }

    override async run(interaction: AutocompleteInteraction) {
        const name = interaction.options.getString("name")
        this.client.logger.debug(name)

        const allRoles = await this.client.prisma.role.findMany({
            select: {
                name: true,
            },
        })

        this.client.logger.debug(allRoles)

        if (name) {
            const roles = allRoles.filter((role: { name: string }) => role.name.toLowerCase().includes(name.toLowerCase()))
            return interaction.respond(roles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
        }
        this.client.logger.debug("No name")
        return interaction.respond(allRoles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
    }
}
