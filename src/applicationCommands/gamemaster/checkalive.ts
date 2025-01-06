import {
	ApplicationCommandOptionType,
	ChannelType,
	type ChatInputCommandInteraction
} from "discord.js"
import { serverIds } from "~/config"
import { getAllPlayers } from "~/database/getData"
import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("checkalive", client, {
			description: `Check alive players for mutual channels`,
			options: [
				{
					name: "all",
					description: "Require all players to be alive",
					type: ApplicationCommandOptionType.Boolean,
					required: false
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		if (!interaction.guild)
			return interaction.editReply("This command can only be used in a server")

		const all = interaction.options.getBoolean("all")

		const players = await getAllPlayers()
		const filtered = players.filter((x) => x.isAlive && x.discordId !== null)

		const channels = interaction.guild.channels.cache
			.filter((x) => x.type === ChannelType.GuildText)
			.filter((x) => serverIds.inGameCategories.includes(x.parentId ?? ""))
			.filter((x) => {
				if (all)
					return filtered.every((member) =>
						x
							// biome-ignore lint/style/noNonNullAssertion: hrm
							.permissionsFor(member.discordId!)
							?.has("ViewChannel")
					)
				return filtered.some((member) =>
					x
						// biome-ignore lint/style/noNonNullAssertion: hrm
						.permissionsFor(member.discordId!)
						?.has("ViewChannel")
				)
			})
			.filter((x) => x.name !== "instructions")

		return interaction.editReply(
			`Found ${channels.size} alliance channels that ${all ? "all" : "at least some"} alive players have access to:\n${channels
				.map(
					(x) =>
						`<#${x.id}> - ${x.permissionOverwrites.cache
							.filter((x) => players.find((a) => a.discordId === x.id))
							.map((y) => `<@${y.id}>`)
							.join(", ")}`
				)
				.join("\n")}`
		)
	}
}
