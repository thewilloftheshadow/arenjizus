import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	type ChatInputCommandInteraction
} from "discord.js"
import { serverIds } from "~/config"
import database, {} from "~/database"
import { queueAbility } from "~/database/ability"
import {
	getAbility,
	getAllPlayers,
	getDiscordPlayer,
	getPlayer,
	getPlayerAbility
} from "~/database/getData"
import {
	generateErrorMessage,
	generateWarningMessage
} from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("use", client, {
			description: `Use one of your abilities`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "ability",
					description: "The name of the ability",
					required: true,
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "target",
					description: "The target of the ability",
					required: false,
					autocomplete: true
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	): Promise<void> {
		switch (option.name) {
			case "ability": {
				const allAbilities = await database.playerAbilities.findMany({
					where: {
						player: { discordId: interaction.user.id },
						usesLeft: { gt: 0 }
					},
					select: { abilityName: true }
				})
				if (option.value) {
					const abilities = allAbilities.filter((ability) =>
						ability.abilityName
							.toLowerCase()
							.includes(option.value.toLowerCase())
					)
					return interaction.respond([
						...abilities.map((ability) => ({
							name: ability.abilityName,
							value: ability.abilityName
						})),
						{
							name: option.value,
							value: option.value
						}
					])
				}
				return interaction.respond([
					...allAbilities.map((ability) => ({
						name: ability.abilityName,
						value: ability.abilityName
					})),
					{
						name: "You can also type in a custom ability you want to do!",
						value: "x"
					}
				])
			}
			case "target": {
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(
						players.map((player) => ({ name: player.name, value: player.name }))
					)
				}
				return interaction.respond(
					allPlayers.map((player) => ({
						name: player.name,
						value: player.name
					}))
				)
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		if (interaction.options.getString("ability", true) === "x")
			return interaction.editReply(
				generateWarningMessage({
					description:
						"Please select an ability from the list or type in your own ability to do."
				})
			)

		const player = await getDiscordPlayer(interaction.user.id)
		if (!player) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Player not linked",
						description:
							"The gamemasters have not yet linked any player data to your Discord account. Please contact them to do so."
					},
					false,
					true
				)
			)
		}

		const ability = await getAbility(
			interaction.options.getString("ability", true),
			player.id
		)
		if (!ability) return interaction.editReply("Ability not found.")
		const playerAbility = await getPlayerAbility(player.name, ability.name)

		if (!ability || !playerAbility) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Ability not found",
						description:
							"The ability you specified could not be found. Please check your spelling and try again."
					},
					false,
					true
				)
			)
		}

		if (playerAbility.usesLeft === 0) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Ability exhausted",
						description: "The ability you specified has no uses remaining."
					},
					false,
					true
				)
			)
		}

		const channel = await interaction.guild?.channels.cache.find(
			(c) =>
				c.name.toLowerCase() ===
				`gm-${player.name.toLowerCase().replace(/ /g, "-")}`
		)
		if (!channel || !channel.isTextBased()) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Channel not found",
						description: `I was unable to find your player channel (\`#gm-${player.name
							.toLowerCase()
							.replace(
								/ /g,
								"-"
							)}\`). Please contact the gamemasters to resolve this issue.`
					},
					false,
					true
				)
			)
		}

		const target = interaction.options.getString("target", false)
		if (target) {
			const targetPlayer = await getPlayer(target)
			if (!targetPlayer) {
				return interaction.editReply(
					generateErrorMessage(
						{
							title: "Player not found",
							description: `I was unable to find a player with the name \`${target}\`. Please check your spelling and try again.`
						},
						false,
						true
					)
				)
			}
		}

		await queueAbility(playerAbility.id)

		await channel.send({
			content: `<@&${serverIds.roles.gamemaster}>, ${
				player.name
			} wants to use ${ability.name}${target ? ` on ${target}` : ""}!`,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder()
						.setCustomId(`use:${playerAbility.id}`)
						.setLabel("Approve")
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId(`rejectUse:${playerAbility.id}`)
						.setLabel("Deny")
						.setStyle(ButtonStyle.Danger)
				])
			],
			allowedMentions: { roles: [serverIds.roles.gamemaster] }
		})

		await interaction.editReply({
			content: `Your request to use ${ability.name} has been sent to the gamemasters.`
		})
	}
}
