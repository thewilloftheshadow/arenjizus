import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import { serverIds } from "~/config"
import { getAllPlayers } from "~/database/getData"
import { ChannelType, type ChatInputCommandInteraction } from "discord.js"

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

		const players = await getAllPlayers()
		const filtered = players.filter((x) => x.isAlive && x.discordId !== null)

		const channels = interaction.guild.channels.cache
			.filter((x) => x.type === ChannelType.GuildText)
			.filter((x) => serverIds.inGameCategories.includes(x.parentId ?? ""))
			.filter((x) => {
				return filtered.every((member) =>
					x
						// biome-ignore lint/style/noNonNullAssertion: hrm
						.permissionsFor(member.discordId!)
						?.has("ViewChannel")
				)
			})
			.filter((x) => x.name !== "instructions")

		return interaction.editReply(
			`Found ${channels.size} alliance channels that all alive players have access to:\n${channels
				.map((x) => `<#${x.id}>`)
				.join("\n")}`
		)
	}
}
