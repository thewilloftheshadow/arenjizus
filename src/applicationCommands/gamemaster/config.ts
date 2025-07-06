import {
	ApplicationCommandOptionType,
	AutocompleteInteraction,
	type ChatInputCommandInteraction,
	EmbedBuilder
} from "discord.js"
import { admins, gameConfig } from "~/config"
import database from "~/database"
import type { BetterClient } from "~/lib"
import { ApplicationCommand } from "~/lib"

export default class Config extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("config", client, {
			description: `Configure the game`,
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "view",
					description: "View the current configuration",
					options: [
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "ephemeral",
							description:
								"Whether to send the response ephemerally (default true)",
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "set",
					description: "Set a configuration value",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "key",
							description: "The key to configure",
							required: true,
							autocomplete: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: "value",
							description: "The value to set",
							required: true
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: "ephemeral",
							description:
								"Whether to send the response ephemerally (default true)",
							required: false
						}
					]
				}
			]
		})
	}

	override async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true)
		const key = focusedOption.name
		if (focusedOption.value.length < 2) {
			await interaction.respond(
				gameConfig.map((option) => ({
					name: option.key,
					value: option.key
				}))
			)
			return
		}
		const options = gameConfig.filter((option) =>
			option.key.toLowerCase().startsWith(key.toLowerCase())
		)
		await interaction.respond(
			options.map((option) => ({ name: option.key, value: option.key }))
		)
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (!admins.includes(interaction.user.id)) {
			interaction.reply({
				content: `You can't even use this anyway`,
				ephemeral: true
			})
			return
		}
		const subcommand = interaction.options.getSubcommand()
		if (subcommand === "view") {
			const data = await database.keyV.findMany()
			const ephemeral = interaction.options.getBoolean("ephemeral") ?? true
			const embed = new EmbedBuilder().setTitle("Configuration").setDescription(
				gameConfig
					.map((option) => {
						const value =
							option.type === "boolean"
								? data.find((k) => k.key === option.key)?.valueBoolean
								: option.type === "integer"
									? data.find((k) => k.key === option.key)?.valueInt
									: data.find((k) => k.key === option.key)?.value
						return `**${option.key}**: \`${value}\`\n(${option.description})`
					})
					.join("\n\n")
			)
			interaction.reply({ embeds: [embed], ephemeral })
		} else if (subcommand === "set") {
			const key = interaction.options.getString("key", true)
			const value = interaction.options.getString("value", true)
			const config = gameConfig.find((option) => option.key === key)
			if (!config) {
				interaction.reply({
					content: `Invalid configuration key`,
					ephemeral: true
				})
				return
			}
			if (config.type === "string") {
				await database.keyV.upsert({
					where: { key },
					create: { key, value },
					update: { value }
				})
			} else if (config.type === "integer") {
				await database.keyV.upsert({
					where: { key },
					create: { key, valueInt: Number.parseInt(value) },
					update: { valueInt: Number.parseInt(value) }
				})
			} else if (config.type === "boolean") {
				await database.keyV.upsert({
					where: { key },
					create: { key, valueBoolean: value === "true" },
					update: { valueBoolean: value === "true" }
				})
			}
			const ephemeral = interaction.options.getBoolean("ephemeral") ?? true
			await interaction.reply({
				content: `Configuration updated: \`${key}\` set to \`${value}\``,
				ephemeral
			})
		}
	}
}
