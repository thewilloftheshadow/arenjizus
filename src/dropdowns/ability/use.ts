import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type StringSelectMenuInteraction
} from "discord.js"
import { serverIds } from "~/config"
import database from "~/database"
import { type BetterClient, Dropdown } from "~/lib"

export default class Droppy extends Dropdown {
	constructor(client: BetterClient) {
		super("use", client, {})
	}

	override async run(interaction: StringSelectMenuInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const member = await interaction.guild?.members.fetch(interaction.user.id)
		if (!member) return
		if (!member.roles.cache.has(serverIds.roles.gamemaster))
			return interaction.editReply("You are not a gamemaster.")

		const id = interaction.customId.split(":")[1]
		const playerAbility = await database.playerAbilities.findFirst({
			where: {
				id
			},
			include: {
				player: true,
				ability: true
			}
		})
		if (!playerAbility)
			return interaction.editReply("Ability queue entry not found.")

		await interaction.reply({
			content: `${
				playerAbility.playerName
			} wants to use ${playerAbility.abilityName}!`,
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
	}
}
