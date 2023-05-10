import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"
import database from "@internal/database"


export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("everything", client, {
			description: `See a list of *everything*`,
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: "text-only",
					description: "Only show the text",
				},
			],
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const rolesData = await database.role.findMany()
		const playersData = await database.player.findMany({})
		const itemsData = await database.item.findMany()

		const roles = rolesData.map((role) => role.name)
		const items = itemsData.map((item) => item.name)
		const players = playersData.map((player) => ` ${player.deathStatus ? "😃" : "💀"} ${player.name}`)
		const votes = playersData.map((player) =>
			player.votedForName
				? `${player.name} - ${player.voteWorth} vote${player.voteWorth === 1 ? "" : "s"} for ${player.votedForName}`
				: `${player.name} - No vote`)

		const doText = interaction.options.getBoolean("text-only", false) || false

		if (doText) {
			return interaction.editReply(
				`Roles: ${roles.join(", ")}\nItems: ${items.join(", ")}\nVotes: ${votes.join(", ")}\n\nPlayers:\n${players.join("\n")}`
			)
		}
		interaction.editReply({
			embeds: [
				new EmbedBuilder().setTitle("Roles").setColor("Random").setDescription(roles.join("\n")),
				new EmbedBuilder().setTitle("Players").setColor("Random").setDescription(players.join("\n")),
				new EmbedBuilder().setTitle("Votes").setColor("Random").setDescription(votes.join("\n")),
				new EmbedBuilder().setTitle("Items").setColor("Random").setDescription(items.join("\n")),
			],
		})
	}
}
