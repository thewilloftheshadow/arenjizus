import { sleep } from "bun"
import {
	ApplicationCommandOptionType,
	ChannelType,
	type ChatInputCommandInteraction,
	type Collection,
	type GuildTextBasedChannel
} from "discord.js"
import { serverIds } from "~/config"
import { getAllPlayers } from "~/database/getData"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

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

		const allOfChannels = await interaction.guild.channels.fetch()
		const allChannels = allOfChannels.filter(
			(x) => x && x.type === ChannelType.GuildText
		) as Collection<string, GuildTextBasedChannel>
		await sleep(5000)

		const channels = allChannels
			.filter((x) => x.type === ChannelType.GuildText)
			.filter((x) => serverIds.inGameCategories.includes(x.parentId ?? ""))
			.filter((x) => {
				if (all)
					return filtered.every(
						(member) =>
							member.discordId &&
							x.permissionsFor(member.discordId)?.has("ViewChannel")
					)
				return filtered.some(
					(member) =>
						member.discordId &&
						x.permissionsFor(member.discordId)?.has("ViewChannel")
				)
			})
			.filter((x) => x.name !== "instructions")

		const response = `Found ${channels.size} alliance channels that ${all ? "all" : "at least some"} alive players have access to:\n${channels
			.map(
				(x) =>
					`<#${x.id}> - ${x.permissionOverwrites.cache
						.filter((x) => players.find((a) => a.discordId === x.id))
						.map((y) => `<@${y.id}>`)
						.join(", ")}`
			)
			.join("\n")}`

		if (response.length > 2000) {
			await interaction.editReply(
				`Found ${channels.size} alliance channels that ${all ? "all" : "at least some"} alive players have access to.\nThis is above the max limit for this command.`
			)
		} else {
			await interaction.editReply(response)
		}
	}
}
