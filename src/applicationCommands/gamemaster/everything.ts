import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction,
	EmbedBuilder
} from "discord.js"
import {
	getAllAbilities,
	getAllItems,
	getAllLocations,
	getAllPlayers,
	getAllRoles
} from "~/database/getData"
import { Paginator } from "~/functions/paginator"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("everything", client, {
			description: `See a list of *everything*`,
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "text-only",
					description: "Only show the text"
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const rolesData = await getAllRoles()
		const playersData = await getAllPlayers()
		const itemsData = await getAllItems()
		const abilityData = await getAllAbilities()
		const locationData = await getAllLocations()

		const roles = rolesData.map((role) => role.name)
		const items = itemsData.map((item) => item.name)
		const players = playersData.map(
			(player) => ` ${player.isAlive ? "😃" : "💀"} ${player.name}`
		)
		const votes = playersData.map((player) =>
			player.votedForName
				? `${player.name} - ${player.voteWorth} vote${
						player.voteWorth === 1 ? "" : "s"
					} for ${player.votedForName}`
				: `${player.name} - No vote`
		)
		const abilities = abilityData.map((ability) => ability.name)

		const doText = interaction.options.getBoolean("text-only", false) || false

		if (doText) {
			return interaction.editReply(
				`Roles: ${roles.join(", ")}\nItems: ${items.join(
					", "
				)}\nVotes: ${votes.join(", ")}\n\nPlayers:\n${players.join("\n")}`
			)
		}
		const paginator = new Paginator(
			{
				id: interaction.id,
				userId: interaction.user.id,
				client: this.client
			},
			[
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Roles")
							.setColor("Random")
							.setDescription(roles.join("\n") || "**")
							.toJSON()
					]
				},
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Players")
							.setColor("Random")
							.setDescription(players.join("\n") || "**")
							.toJSON()
					]
				},
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Votes")
							.setColor("Random")
							.setDescription(votes.join("\n") || "**")
							.toJSON()
					]
				},
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Items")
							.setColor("Random")
							.setDescription(items.join("\n") || "**")
							.toJSON()
					]
				},
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Abilities")
							.setColor("Random")
							.setDescription(abilities.join("\n") || "**")
							.toJSON()
					]
				},
				{
					embeds: [
						new EmbedBuilder()
							.setTitle("Locations")
							.setColor("Random")
							.setDescription(
								locationData
									.map(
										(location) => `${location.name} - ${location.description}`
									)
									.join("\n") || "**"
							)
							.toJSON()
					]
				}
			]
		)
		await paginator.send(interaction)
	}
}
