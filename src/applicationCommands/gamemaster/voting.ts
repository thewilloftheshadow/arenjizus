import {
	ApplicationCommandOptionType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	EmbedBuilder
} from "discord.js"
import database from "~/database"
import { getAllPlayers, getPlayer } from "~/database/getData"
import { setVote, setVoteWorth } from "~/database/thingys"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Voting extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("voting", client, {
			description: `Manage voting in the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "show",
					description: "Show the current votes"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "close",
					description: "Close voting"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "open",
					description: "Open voting"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "reset",
					description: "Reset voting"
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "setworth",
					description: "Set the worth of a player's vote",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The player to set the worth of",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "worth",
							description: "The worth of the vote",
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "setvote",
					description: "Set a player's vote",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The player to set the vote of",
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "vote",
							description: "The player to vote for",
							required: false
						}
					]
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	) {
		switch (option.name) {
			case "player": {
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction
						.respond(
							players.map((player: { name: string }) => ({
								name: player.name,
								value: player.name
							}))
						)
						.catch(() => {})
				}
				return interaction
					.respond(
						allPlayers.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
					.catch(() => {})
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const players = await getAllPlayers()

		switch (interaction.options.getSubcommand()) {
			case "show": {
				const votes: { [key: string]: { from: string; worth: number }[] } = {}
				for (const player of players) {
					const vote = player.votedForName || "No Vote"
					if (votes[vote]) {
						votes[vote].push({ from: player.name, worth: player.voteWorth })
					} else {
						votes[vote] = [{ from: player.name, worth: player.voteWorth }]
					}
				}
				const embed = new EmbedBuilder()
					.setTitle("Current Votes")
					.setColor("Random")
					.setTimestamp()
					.setDescription("\n")
				for (const vote in votes) {
					if (vote === "No Vote") {
						embed.data.description += `**${
							votes[vote].length
						} people didn't vote**:\n> ${votes[vote]
							.map((y) => y.from)
							.join(", ")}\n\n`
						continue
					}
					const x = votes[vote]
					const worth = x.reduce((a, b) => a + b.worth, 0)
					embed.data.description += `**${worth} vote${
						worth === 1 ? "" : "s"
					} for ${vote}**:\n> ${x
						.map((y) => `${y.from} (${y.worth})`)
						.join(", ")}\n\n`
				}
				return interaction.editReply({ embeds: [embed] })
			}
			// const votes = players.map((player) =>
			//     (player.votedForName
			//         ? `${player.name} - ${player.voteWorth} vote${player.voteWorth === 1 ? "" : "s"} for ${player.votedForName}`
			//         : `${player.name} - No vote`))
			// const embed = new EmbedBuilder().setTitle("Current Votes").setColor("RANDOM").setTimestamp()
			//     .setDescription(votes.join("\n"))
			// return interaction.editReply({ embeds: [embed] })

			case "close":
				await database.keyV.upsert({
					where: {
						key: "canVote"
					},
					update: {
						valueBoolean: false
					},
					create: {
						key: "canVote",
						valueBoolean: false
					}
				})
				return interaction.editReply("Voting has been closed")

			case "open":
				await database.keyV.upsert({
					where: {
						key: "canVote"
					},
					update: {
						valueBoolean: true
					},
					create: {
						key: "canVote",
						valueBoolean: true
					}
				})
				return interaction.editReply("Voting has been opened")

			case "reset":
				await database.player.updateMany({
					data: {
						votedForName: null
					}
				})
				return interaction.editReply("Votes have been reset")

			case "setworth": {
				const player = interaction.options.getString("player", true)
				const worth = interaction.options.getInteger("worth", true)
				const playerData = await getPlayer(player)
				if (!playerData) return interaction.editReply("Player not found")
				await setVoteWorth(player, worth)
				return interaction.editReply(`Set ${player}'s vote worth to ${worth}`)
			}

			case "setvote": {
				const player2 = interaction.options.getString("player", true)
				const vote = interaction.options.getString("vote", false)
				const playerData2 = await getPlayer(player2)
				if (!playerData2) return interaction.editReply("Player not found")
				setVote(player2, vote)
				return interaction.editReply(`Set ${player2}'s vote to ${vote}`)
			}
		}
	}
}
