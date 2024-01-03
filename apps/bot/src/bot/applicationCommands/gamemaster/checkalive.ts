import { ApplicationCommand } from "@buape/lib"
import { BetterClient } from "@buape/lib"
import { serverIds } from "@internal/config"
import { ChannelType, ChatInputCommandInteraction } from "discord.js"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("checkalive", client, {
			description: `Check alive players for mutual channels`
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		if (!interaction.guild)
			return interaction.editReply("This command can only be used in a server")
		const members = await interaction.guild.members.fetch()

		const filtered = members.filter((x) =>
			x.roles.cache.has(serverIds.roles.player)
		)

		const channels = interaction.guild.channels.cache
			.filter((x) => x.type === ChannelType.GuildText)
			.filter((x) => serverIds.inGameCategories.includes(x.parentId ?? ""))
			.filter((x) => {
				return filtered.every((member) =>
					x.permissionsFor(member)?.has("ViewChannel")
				)
			})

		return interaction.editReply(
			`Found ${channels.size} channels:\n${channels
				.map((x) => `<#${x.id}>`)
				.join("\n")}`
		)
	}
}
