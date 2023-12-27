import {
	ActionRowBuilder,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	ComponentType,
	StringSelectMenuBuilder,
} from "discord.js"
import { ApplicationCommand } from "@buape/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@buape/lib"
import database, {
	AbilityProperty,
	abilityEmbed,
	allProperties,
	createAbility,
	getAbilitiesWithProperty,
	getAbility,
	getAllAbilities,
	getAllItems,
	getAllPlayers,
	getAllRoles,
	getItem,
	getPlayer,
	getPropertyDetails,
	getRole,
	grantAbility,
	resetAbilityUses,
	resetAllAbilityUses,
	setPropertiesForAbility,
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
					name: "set_uses",
					description: "Set the number of uses an ability has for a player",
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
						{
							type: ApplicationCommandOptionType.Integer,
							name: "uses",
							description: "The number of uses the player has",
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
					name: "reset_uses",
					description: "Reset the timed uses of all abilities",
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: "type",
							description: "The type of ability to reset",
							required: true,
							choices: [
								{
									name: "Day abilities",
									value: "day",
								},
								{
									name: "Night abilities",

									value: "night",
								},
								{
									name: "Day + night abilities",
									value: "both",
								},
							],
						},
					],
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
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: "set_properties",
					description: "Set the properties of an ability",
					options: [
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
					type: ApplicationCommandOptionType.SubcommandGroup,
					name: "link",
					description: "Link an ability to a thing",
					options: [
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "role",
							description: "Link an ability to a role",
							options: [
								{
									type: ApplicationCommandOptionType.String,
									name: "ability",
									description: "The name of the ability",
									required: true,
									autocomplete: true,
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "role",
									description: "The name of the role",
									required: true,
									autocomplete: true,
								},
							],
						},
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "item",
							description: "Link an ability to an item",
							options: [
								{
									type: ApplicationCommandOptionType.String,
									name: "ability",
									description: "The name of the ability",
									required: true,
									autocomplete: true,
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "give_item",
									description: "The name of the item that this ability is given with",
									required: false,
									autocomplete: true,
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "subtract_item",
									description: "The name of the item to subtract when this ability is used",
									required: false,
									autocomplete: true,
								},
							],
						},
					],
				},
				{
					type: ApplicationCommandOptionType.SubcommandGroup,
					name: "unlink",
					description: "Unlink an ability from a thing",
					options: [
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "role",
							description: "Unlink an ability from a role",
							options: [
								{
									type: ApplicationCommandOptionType.String,
									name: "ability",
									description: "The name of the ability",
									required: true,
									autocomplete: true,
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "role",
									description: "The name of the role",
									required: true,
									autocomplete: true,
								},
							],
						},
						{
							type: ApplicationCommandOptionType.Subcommand,
							name: "item",
							description: "Unlink an ability from an item",
							options: [
								{
									type: ApplicationCommandOptionType.String,
									name: "ability",
									description: "The name of the ability",
									required: true,
									autocomplete: true,
								},
								{
									type: ApplicationCommandOptionType.String,
									name: "item",
									description: "The name of the item to unlink",
									required: true,
									autocomplete: true,
								},
							],
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
						ability.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(abilities.map((ability: { name: string }) => ({ name: ability.name, value: ability.name })))
				}
				return interaction.respond(allAbilities.map((ability: { name: string }) => ({ name: ability.name, value: ability.name })))
			}
			case "role": {
				const allRoles = await getAllRoles()
				if (option.value) {
					const roles = allRoles.filter((role: { name: string }) => role.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(roles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
				}
				return interaction.respond(allRoles.map((role: { name: string }) => ({ name: role.name, value: role.name })))
			}
			case "give_item":
			case "subtract_item":
			case "item":
				const allItems = await getAllItems()
				if (option.value) {
					const items = allItems.filter((item: { name: string }) => item.name.toLowerCase().includes(option.value.toLowerCase()))
					return interaction.respond(items.map((item: { name: string }) => ({ name: item.name, value: item.name })))
				}
				return interaction.respond(allItems.map((item: { name: string }) => ({ name: item.name, value: item.name })))
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const subcommandGroup = interaction.options.getSubcommandGroup()
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
			case "reset_uses": {
				const type = interaction.options.getString("type", true) as "day" | "night" | "both"
				const abilities = await getAbilitiesWithProperty(
					type === "day" ? AbilityProperty.resetWithDay : type === "night" ? AbilityProperty.resetWithNight : AbilityProperty.resetWithPhase
				)
				const errors: string[] = []
				for (const ability of abilities) {
					const done = await resetAllAbilityUses(ability)
					if (done.isErr()) errors.push(done.unwrapErr())
				}
				if (errors.length > 0) return interaction.editReply(errors.join("\n"))
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
			case "set_properties": {
				const abilityName = interaction.options.getString("ability", true)
				const ability = await getAbility(abilityName)
				if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
				// const currentProperties = getPropertyDetails(ability.properties)
				const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					new StringSelectMenuBuilder()
						.setCustomId("set_properties")
						.setPlaceholder("Select properties to set")
						.addOptions(
							getPropertyDetails(allProperties).map((property) => {
								return {
									label: property.name,
									description: property.description,
									value: `${property.value}`,
								}
							})
						)
						.setMinValues(1)
				)
				row.components[0].setMaxValues(row.components[0].options.length)
				const message = await interaction.editReply({ embeds: [abilityEmbed(ability)], components: [row] })
				const result = await message.awaitMessageComponent({
					componentType: ComponentType.StringSelect,
					time: 60000,
					filter: (i) => i.user.id === interaction.user.id,
				})
				if (!result) return interaction.followUp("Timed out")
				await result.deferUpdate()

				const properties = result.values.map((value) => parseInt(value)).reduce((a, b) => a | b)
				await setPropertiesForAbility(abilityName, properties)
				return interaction.followUp(
					`Set properties for ${abilityName}: ${getPropertyDetails(properties)
						.map((property) => property.name)
						.join(", ")}`
				)
			}
			case "role": {
				if (subcommandGroup === "link") {
					const abilityName = interaction.options.getString("ability", true)
					const roleName = interaction.options.getString("role", true)
					const ability = await getAbility(abilityName)
					if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
					const role = await getRole(roleName)
					if (!role) return interaction.editReply(`No role with name ${roleName}`)
					await database.abilityRoleLink.upsert({
						where: {
							abilityName_roleName: {
								abilityName: abilityName,
								roleName: roleName,
							},
						},
						create: {
							abilityName: abilityName,
							roleName: roleName,
						},
						update: {},
					})
					return interaction.editReply(`The ${abilityName} ability will now be given with the ${roleName} role`)
				} else {
					const abilityName = interaction.options.getString("ability", true)
					const roleName = interaction.options.getString("role", true)
					const ability = await getAbility(abilityName)
					if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
					const role = await getRole(roleName)
					if (!role) return interaction.editReply(`No role with name ${roleName}`)
					await database.abilityRoleLink.delete({
						where: {
							abilityName_roleName: {
								abilityName: abilityName,
								roleName: roleName,
							},
						},
					})
					return interaction.editReply(`The ${abilityName} ability will no longer be given with the ${roleName} role`)
				}
			}

			case "item": {
				if (subcommandGroup === "link") {
					const abilityName = interaction.options.getString("ability", true)
					const ability = await getAbility(abilityName)
					if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
					const giveItemName = interaction.options.getString("give_item", false)
					const subtractItemName = interaction.options.getString("subtract_item", false)
					if (giveItemName) {
						const item = await getItem(giveItemName)
						if (!item) return interaction.editReply(`No item with name ${giveItemName}`)
						await database.abilityItemLink.upsert({
							where: {
								abilityName_itemName: {
									abilityName: abilityName,
									itemName: giveItemName,
								},
							},
							create: {
								abilityName: abilityName,
								itemName: giveItemName,
								giveWithItem: true,
							},
							update: {
								giveWithItem: true,
							},
						})
					}
					if (subtractItemName) {
						const item = await getItem(subtractItemName)
						if (!item) return interaction.editReply(`No item with name ${subtractItemName}`)
						await database.abilityItemLink.upsert({
							where: {
								abilityName_itemName: {
									abilityName: abilityName,
									itemName: subtractItemName,
								},
							},
							create: {
								abilityName: abilityName,
								itemName: subtractItemName,
								giveWithItem: false,
							},
							update: {
								giveWithItem: false,
							},
						})
					}
					return interaction.editReply(
						`${giveItemName ? `The ${abilityName} ability will now be given with the ${giveItemName} item` : ""}${
							subtractItemName ? `The ${abilityName} ability will now be subtracted with the ${subtractItemName} item` : "No changes."
						}`
					)
				} else {
					const abilityName = interaction.options.getString("ability", true)
					const ability = await getAbility(abilityName)
					if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
					const itemName = interaction.options.getString("item", true)
					const item = await getItem(itemName)
					if (!item) return interaction.editReply(`No item with name ${itemName}`)
					const done = await database.abilityItemLink.deleteMany({
						where: {
							abilityName,
							itemName,
						},
					})
					return interaction.editReply(`Removed ${done.count} links`)
				}
			}

			case "set_uses": {
				const abilityName = interaction.options.getString("ability", true)
				const ability = await getAbility(abilityName)
				if (!ability) return interaction.editReply(`No ability with name ${abilityName}`)
				const playerName = interaction.options.getString("player", true)
				const player = await getPlayer(playerName)
				if (!player) return interaction.editReply(`No player with name ${playerName}`)
				const uses = interaction.options.getInteger("uses", true)
				await resetAbilityUses(abilityName, playerName, uses)
				return interaction.editReply(`Set ${playerName}'s ${abilityName} uses to ${uses}`)
			}
		}
	}
}
