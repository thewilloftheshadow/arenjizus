import { embedSpacer } from "@internal/config"
import { generateTimestamp, titleCase } from "@internal/functions"
import { EmbedBuilder } from "discord.js"
import {
	Ability,
	AbilityItemLink,
	AbilityRoleLink,
	Investment,
	Item,
	Location,
	Player,
	PlayerAbilities,
	PlayerBallData,
	PlayerItems,
	PlayerNotes,
	PlayerRoles,
	Role,
	getPropertyDetails
} from "../index.js"

export const itemEmbed = (
	item: Item & {
		players: PlayerItems[]
		linkedAbilities: AbilityItemLink[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(item.name)
		.setColor("Random")
		.setImage(embedSpacer)
		.setDescription("\n")
	if (item.description)
		embed.data.description += `${item.description.slice(0, 1500)}`
	embed.data.description += `\nPrice: ${item.price}`
	if (!hideUsers) {
		embed.addFields({
			name: `${item.players.filter((x) => x.amount > 0).length} Players:`,
			value:
				item.players
					.filter((x) => x.amount > 0)
					.map((x) => `${x.playerName} (${x.amount})`)
					.join(", ") || "** **",
			inline: true
		})
	}
	return embed
}

export const playerEmbed = (
	player: Player & {
		roles?: PlayerRoles[]
		items?: PlayerItems[]
		ballData?: PlayerBallData | null
		votedFor?: Player | null
		playersVotedFor?: Player[]
		abilities?: PlayerAbilities[]
		notes?: PlayerNotes[]
		investments?: Investment[]
	},
	gamemaster = false
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(player.name)
		.setColor("Random")
		.setImage(embedSpacer)

	embed.data.description = `Money: ${player.money}\n`
	embed.data.description += `Death Status: ${titleCase(player.deathStatus)}\n`
	embed.data.description += `Robberies Left: ${player.robberiesLeft}\n`
	embed.data.description += `Night Teleports Left: ${player.teleports}\n`
	if (player.roles)
		embed.addFields({
			name: `${player.roles.length} Roles:`,
			value: `${player.roles.map((x) => x.roleName).join(", ")}` || "** **",
			inline: true
		})
	if (player.items) {
		embed.addFields({
			name: `${player.items.filter((x) => x.amount > 0).length} Items:`,
			value:
				`${player.items
					.filter((x) => x.amount > 0)
					.map((x) => `${x.amount}x ${x.itemName}`)
					.join(", ")}` || "** **",
			inline: true
		})
	}
	if (player.abilities) {
		embed.addFields({
			name: `${
				player.abilities.filter((x) => x.usesLeft > 0).length
			} Abilities:`,
			value:
				`${player.abilities
					.filter((x) => x.usesLeft > 0)
					.map((x) => `${x.abilityName} - ${x.usesLeft}`)
					.join("\n")}` || "** **",
			inline: true
		})
	}
	if (player.investments) {
		embed.addFields({
			name: `${player.investments.length} Investments:`,
			value:
				`${player.investments
					.map(
						(x) =>
							`$${x.amount} investment ends ${generateTimestamp({
								timestamp: x.expiresAt,
								type: "R"
							})}`
					)
					.join("\n")}` || "** **",
			inline: true
		})
	}
	if (player.notes && gamemaster) {
		embed.addFields([
			{
				name: `Notes:`,
				value:
					player.notes
						.map(
							(x) =>
								`${generateTimestamp({ timestamp: x.createdAt, type: "f" })} ${
									x.note
								}`
						)
						.join("\n") || "** **"
			}
		])
	}

	return embed
}

export const roleEmbed = (
	role: Role & {
		players: PlayerRoles[]
		linkedAbilities?: AbilityRoleLink[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(role.name)
		.setColor("Random")
		.setImage(embedSpacer)
	if (role.description) embed.data.description = role.description.slice(0, 1500)
	if (!hideUsers)
		embed.addFields({
			name: `${role.players.length} Players:`,
			value: role.players.map((x) => x.playerName).join(", ") || "** **",
			inline: true
		})
	if (role.name.toLowerCase().includes("bezos"))
		embed.setImage("https://tenor.com/bgUX6.gif")
	return embed
}

export const abilityEmbed = (
	ability: Ability & {
		playersWithAbility: PlayerAbilities[]
		linkedRoles: AbilityRoleLink[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(ability.name)
		.setColor("Random")
		.setImage(embedSpacer)
	if (ability.description)
		embed.data.description = ability.description.slice(0, 1500)
	if (ability.linkedRoles.length > 0)
		embed.addFields([
			{
				name: `Linked Roles:`,
				value: ability.linkedRoles.map((x) => x.roleName).join(", ") || "** **"
			}
		])
	embed.addFields([
		{
			name: `Properties:`,
			value:
				getPropertyDetails(ability.properties)
					.map((x) => `${x.name} - ${x.description}`)
					.join("\n") || "** **"
		}
	])
	if (!hideUsers)
		embed.addFields([
			{
				name: `${
					ability.playersWithAbility.filter((x) => x.usesLeft > 0).length
				} Players:`,
				value:
					ability.playersWithAbility
						.filter((x) => x.usesLeft > 0)
						.map((x) => x.playerName)
						.join(", ") || "** **"
			}
		])
	return embed
}

export const locationEmbed = (
	location: Location & {
		players: Player[]
	}
): EmbedBuilder => {
	const embed = new EmbedBuilder()
		.setTitle(location.name)
		.setColor("Random")
		.setImage(embedSpacer)
	if (location.description)
		embed.data.description = location.description.slice(0, 1500)
	if (location.players) {
		embed.addFields([
			{
				name: `Players:`,
				value: location.players.map((x) => x.name).join(", ") || "** **"
			}
		])
	}
	return embed
}
