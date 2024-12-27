import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import { serverIds } from "~/config"
import database from "~/database"
import { logger } from "~/logger"
import {
	ApplicationCommandOptionType,
	type ChatInputCommandInteraction
} from "discord.js"

export default class Vote extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("lasagna", client, {
			description: `The secret command!`,
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The name you want to be referred to as in this game",
					required: true
				}
			]
		})
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild)
			return interaction.reply("This command can only be used in a server")
		await interaction.deferReply({ ephemeral: true })
		const name = titleCase(interaction.options.getString("name", true))

		await database.player.create({
			data: {
				name,
				discordId: interaction.user.id
			}
		})

		const channel = await interaction.guild.channels.create({
			name: `gm-${name}`,
			parent: "1105539810069860411"
		})

		await channel.lockPermissions()
		await channel.permissionOverwrites.create(interaction.user.id, {
			ViewChannel: true
		})
		logger.gameLog(
			`${name} has joined the game, and linked as <@${interaction.user.id}>!`
		)

		const member = await interaction.guild.members.fetch(interaction.user.id)
		await member.roles.add(serverIds.roles.player)
		await member.roles.remove(serverIds.roles.spectator)

		await member.setNickname(name)

		await interaction.editReply({
			content: `Done`
		})

		channel.send({
			content: `Welcome to the game, ${name}!`
		})
	}
}

const titleCase = (str: string) => {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ")
}
