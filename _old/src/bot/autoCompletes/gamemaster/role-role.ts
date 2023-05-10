import { AutocompleteInteraction } from "discord.js"
import AutoComplete from "../../../../lib/classes/AutoComplete"
import BlobbyClient from "../../../../lib/extensions/BlobbyClient"

export default class Role extends AutoComplete {
	constructor(client: BlobbyClient) {
		super("role-role", client)
	}

	override async run(interaction: AutocompleteInteraction) {
		const name = interaction.options.getString("role")
		logger.debug(name)

		const allRoles = await database.role.findMany({
			select: {
				name: true,
			},
		})

		if (name) {
			const roles = allRoles.filter((role: { name: string }) => role.name.toLowerCase().includes(name.toLowerCase()))
			return interaction.respond(roles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
		}
		return interaction.respond(allRoles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
	}
}
