import { AutocompleteFocusedOption, AutocompleteInteraction, CacheType, ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommand } from "@internal/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@internal/lib"
import {
	AbilityProperty,
	abilityEmbed,
	createAbility,
	getAbilitiesWithProperty,
	getAbility,
	getAllAbilities,
	getAllPlayers,
	grantAbility,
	resetAllAbilityUses,
} from "@internal/database"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("ability", client, {
			description: `Manage abilities`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "create",
					description: "Create an ability",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "name",
							description: "The name of the ability",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "description",
							description: "The description of the ability",
							required: true,
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: "uses",
							description: "The number of uses the ability has (before being recharged by GMs)",
							required: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "grant",
					description: "Grant an ability to a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "ability",
							description: "The name of the ability",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "revoke",
					description: "Revoke an ability from a player",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "player",
							description: "The name of the player",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "ability",
							description: "The name of the ability",
							required: true,
							autocomplete: true,
						},
					],
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "reset_daily_uses",
					description: "Reset the daily uses of all abilities",
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View an role",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "ability",
							description: "The name of the ability",
							required: true,
							autocomplete: true,
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "hide_users",
							description: "Whether to hide the users with this ability",
							required: false,
						},
					],
				},
			],
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction<CacheType>, option: AutocompleteFocusedOption): Promise<void> {
		switch (option.name) {
			case "player": {
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) => player.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(players.map((player: { name: string }) => ({ name: player.name, value: player.name })))
				}
				return interaction.respond(allPlayers.map((player: { name: string }) => ({ name: player.name, value: player.name })))
			}
			case "ability": {
				const allAbilities = await getAllAbilities()
				if (option.value) {
					const abilities = allAbilities.filter((ability: { name: string }) =>
						ability.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(abilities.map((ability: { name: string }) => ({ name: ability.name, value: ability.name })))
				}
				return interaction.respond(allAbilities.map((ability: { name: string }) => ({ name: ability.name, value: ability.name })))
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case "create": {
				const name = interaction.options.getString("name", true)
				const description = interaction.options.getString("description", true)
				const uses = interaction.options.getInteger("uses", true)
				const done = await createAbility(name, description, uses)
				if (done.isErr()) return interaction.editReply(done.unwrapErr())
				return interaction.editReply(`Created ability ${name} with description ${description} and ${uses} uses`)
			}
			case "grant": {
				const playerName = interaction.options.getString("player", true)
				const abilityName = interaction.options.getString("ability", true)
				const done = await grantAbility(playerName, abilityName)
				if (done.isErr()) return interaction.editReply(done.unwrapErr())
				return interaction.editReply(`Granted ability ${abilityName} to player ${playerName}`)
			}
			case "revoke": {
				const playerName = interaction.options.getString("player", true)
				const abilityName = interaction.options.getString("ability", true)
				const done = await grantAbility(playerName, abilityName)
				if (done.isErr()) return interaction.editReply(done.unwrapErr())
				return interaction.editReply(`Revoked ability ${abilityName} from player ${playerName}`)
			}
			case "reset_daily_uses": {
				const abilities = await getAbilitiesWithProperty(AbilityProperty.resetWithDay)
				for (const ability of abilities) {
					resetAllAbilityUses(ability)
				}
				return interaction.editReply(`Reset daily uses for ${abilities.length} abilities`)
			}
			case "view": {
				const abilityName = interaction.options.getString("ability", true)
				const hideUsers = interaction.options.getBoolean("hide_users", false) || false
				const ability = await getAbility(abilityName)
				if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
				const embed = abilityEmbed(ability, hideUsers)
				return interaction.editReply({ embeds: [embed] })
			}
		}
	}
}
