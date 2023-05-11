import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
} from "discord.js"
import { ApplicationCommand, BetterClient } from "@internal/lib"
import database, { getAbility, getDiscordPlayer } from "@internal/database"
import { generateErrorMessage } from "@internal/functions"
import { serverIds } from "@internal/config"

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
					autocomplete: true,
				},
			],
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction, option: AutocompleteFocusedOption): Promise<void> {
		switch (option.name) {
			case "ability": {
				const allAbilities = await database.playerAbilities.findMany({
					where: { player: { discordId: interaction.user.id }, usesLeft: {gt: 0} },
					select: { abilityName: true },
				})
				console
				if (option.value) {
					const abilities = allAbilities.filter((ability) => ability.abilityName.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(abilities.map((ability) => ({ name: ability.abilityName, value: ability.abilityName })))
				}
				return interaction.respond(allAbilities.map((ability) => ({ name: ability.abilityName, value: ability.abilityName })))
			}
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const player = await getDiscordPlayer(interaction.user.id)
		if (!player) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Player not linked",
						description: "The gamemasters have not yet linked any player data to your Discord account. Please contact them to do so.",
					},
					false,
					true
				)
			)
		}

		const ability = await getAbility(interaction.options.getString("ability", true))
		const playerAbility = player.abilities.find((a) => a.abilityName === ability?.name)

		if (!ability || !playerAbility) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Ability not found",
						description: "The ability you specified could not be found. Please check your spelling and try again.",
					},
					false,
					true
				)
			)
		}

		console.log(ability)

		if (playerAbility.usesLeft === 0) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Ability exhausted",
						description: "The ability you specified has no uses remaining.",
					},
					false,
					true
				)
			)
		}

		const channel = await interaction.guild?.channels.cache.find((c) => c.name.toLowerCase() === `gm-${player.name}`.toLowerCase())
		if (!channel || !channel.isTextBased()) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Channel not found",
						description: `I was unable to find your player channel (\`#gm-${player.name}\`). Please contact the gamemasters to resolve this issue.`,
					},
					false,
					true
				)
			)
		}

		await channel.send({
			content: `<@&${serverIds.roles.gamemaster}>, ${player.name} wants to use ${ability.name}!`,
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					new ButtonBuilder().setCustomId(`use:${playerAbility.id}`).setLabel("Approve").setStyle(ButtonStyle.Success),
					new ButtonBuilder().setCustomId(`rejectUse`).setLabel("Deny").setStyle(ButtonStyle.Danger),
				]),
			],
			allowedMentions: { roles: [serverIds.roles.gamemaster] },
		})

		await interaction.editReply({
			content: `Your request to use ${ability.name} has been sent to the gamemasters.`,
		})
	}
}
