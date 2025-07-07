import {
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	type ChatInputCommandInteraction
} from "discord.js"
import database, { s3 } from "~/database"
import { getPlayer } from "~/database/getData"
import { generateErrorMessage } from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("set", client, {
			description: `Set a player's anon data`,
			options: [
				{
					name: "player",
					description: "The player to set",
					type: ApplicationCommandOptionType.String,
					required: true,
					autocomplete: true
				},
				{
					name: "name",
					description: "Set your name",
					type: ApplicationCommandOptionType.String,
					required: true
				},
				{
					name: "avatar",
					description: "Set your avatar",
					type: ApplicationCommandOptionType.Attachment,
					required: true
				}
			]
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction) {
		const players = await database.player.findMany({
			where: {
				name: {
					contains: interaction.options.getString("player", true)
				}
			}
		})
		const choices = players.map((player) => ({
			name: player.name,
			value: player.name
		}))
		await interaction.respond(choices)
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ ephemeral: true })
		const config = await database.keyV.findFirst({
			where: {
				key: "anonymous"
			}
		})
		if (!config || !config.valueBoolean) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Disabled",
						description: "Currently unavailable."
					},
					false,
					true
				)
			)
		}
		const player = await getPlayer(
			interaction.options.getString("player", true)
		)

		if (!player) {
			return interaction.editReply(
				generateErrorMessage(
					{
						title: "Player not found",
						description: `The player ${interaction.options.getString("player", true)} was not found.`
					},
					false,
					true
				)
			)
		}
		const name = interaction.options.getString("name")
		const avatar = interaction.options.getAttachment("avatar")
		if (name) {
			player.name = name
		}
		if (avatar) {
			const response = await fetch(avatar.url)
			if (!response.ok) {
				return interaction.editReply(
					generateErrorMessage(
						{
							title: "Avatar Upload Failed",
							description: "Could not download the avatar image."
						},
						false,
						true
					)
				)
			}
			const buffer = Buffer.from(await response.arrayBuffer())
			const fileName = `${player.id}-${Date.now()}.png`
			await s3.write(`avatars/${fileName}`, buffer, {
				type: avatar.contentType || "image/png"
			})
			await database.player.update({
				where: {
					id: player.id
				},
				data: {
					webhookName: name,
					webhookAvatar: fileName
				}
			})
		}
		return interaction.editReply({
			content: "Your data has been updated."
		})
	}
}
