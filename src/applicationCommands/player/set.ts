import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction
} from "discord.js"
import database, { s3 } from "~/database"
import { getDiscordPlayer } from "~/database/getData"
import { generateErrorMessage } from "~/functions/generateMessage"
import { ApplicationCommand, type BetterClient } from "~/lib"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("set", client, {
			description: `Set yourself`,
			options: [
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
		const name = interaction.options.getString("name")
		const avatar = interaction.options.getAttachment("avatar")
		if (name) {
			player.name = name
		}
		if (avatar) {
			// upload the avatar to S3 and set the file name in the database
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
