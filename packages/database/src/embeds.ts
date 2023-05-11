import { embedSpacer } from "@internal/config"
import {
	Item,
	PlayerItems,
	Player,
	PlayerRoles,
	Role,
	PlayerBallData,
	Ability,
	PlayerAbilities,
	AbilityRoleLink,
	getPropertyDescriptions,
} from "../index.js"
import { EmbedBuilder } from "discord.js"
import { titleCase } from "@internal/functions"

export const itemEmbed = (
	item: Item & {
		players: PlayerItems[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder().setTitle(item.name).setColor("Random").setImage(embedSpacer).setDescription("")
	if (item.description) embed.data.description += `${item.description.slice(0, 1500)}\n\n`
	embed.data.description += `Price: ${item.price}`
	if (!hideUsers) {
		embed.addFields({
			name: `${item.players.length} Players:`,
			value: item.players.map((x) => `${x.playerName} (${x.amount})`).join(", ") || "** **",
			inline: true,
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
	}
): EmbedBuilder => {
	const embed = new EmbedBuilder().setTitle(player.name).setColor("Random").setImage(embedSpacer)

	embed.data.description = `Money: ${player.money}\n`
	embed.data.description += `Death Status: ${titleCase(player.deathStatus)}\n`
	embed.data.description += `Robberies Left: ${player.robberiesLeft}\n`
	if (player.roles)
		embed.addFields({
			name: `${player.roles.length} Roles:`,
			value: `${player.roles.map((x) => x.roleName).join(", ")}` || "** **",
			inline: true,
		})
	if (player.items) {
		embed.addFields({
			name: `${player.items.length} Items:`,
			value: `${player.items.map((x) => `${x.amount}x ${x.itemName}`).join(", ")}` || "** **",
			inline: true,
		})
	}
	return embed
}

export const roleEmbed = (
	role: Role & {
		players: PlayerRoles[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder().setTitle(role.name).setColor("Random").setImage(embedSpacer)
	if (role.description) embed.data.description = role.description.slice(0, 1500)
	if (!hideUsers)
		embed.addFields({ name: `${role.players.length} Players:`, value: role.players.map((x) => x.playerName).join(", ") || "** **", inline: true })
	if (role.name.toLowerCase().includes("bezos")) embed.setImage("https://tenor.com/bgUX6.gif")
	return embed
}

export const abilityEmbed = (
	ability: Ability & {
		playersWithAbility: PlayerAbilities[]
		linkedRoles: AbilityRoleLink[]
	},
	hideUsers = false
): EmbedBuilder => {
	const embed = new EmbedBuilder().setTitle(ability.name).setColor("Random").setImage(embedSpacer)
	if (ability.description) embed.data.description = ability.description.slice(0, 1500)
	if (ability.linkedRoles.length > 0)
		embed.addFields([
			{
				name: `Linked Roles:`,
				value: ability.linkedRoles.map((x) => x.roleName).join(", ") || "** **",
			},
		])
	embed.addFields([
		{
			name: `Properties:`,
			value: getPropertyDescriptions(ability.properties).join("\n") || "** **",
		},
	])
	if (!hideUsers)
		embed.addFields([
			{
				name: `${ability.playersWithAbility.length} Players:`,
				value: ability.playersWithAbility.map((x) => x.playerName).join(", ") || "** **",
			},
		])
	return embed
}
