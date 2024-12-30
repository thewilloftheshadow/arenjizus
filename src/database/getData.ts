import database, { type Player } from "~/database"
import { type AbilityProperty, hasProperty } from "~/database/ability"

export const getDiscordPlayer = async (discordId: string) => {
	return await database.player.findFirst({
		where: {
			discordId
		},
		include: {
			roles: true,
			items: true,
			ballData: true,
			abilities: true,
			investments: true,
			location: true,
			notes: true
		}
	})
}

export const getPlayer = async (name: string) => {
	return await database.player.findFirst({
		where: {
			name
		},
		include: {
			roles: true,
			items: true,
			ballData: true,
			abilities: true,
			investments: true,
			location: true,
			notes: true
		}
	})
}

export const getAllPlayers = async () => {
	return await database.player.findMany({
		include: { roles: true, items: true, location: true }
	})
}

export const getItem = async (name: string) => {
	return await database.item.findFirst({
		where: {
			name
		},
		include: {
			players: true,
			linkedAbilities: true
		}
	})
}

export const getPlayerItem = async (playerName: string, itemName: string) => {
	return await database.playerItems.findFirst({
		where: {
			playerName,
			itemName
		}
	})
}

export const getPlayerRole = async (playerName: string, roleName: string) => {
	return await database.playerRoles.findFirst({
		where: {
			playerName,
			roleName
		}
	})
}

export const getRole = async (name: string) => {
	return await database.role.findFirst({
		where: {
			name
		},
		include: {
			players: true,
			linkedAbilities: true
		}
	})
}

export const getAllItems = async () => {
	return await database.item.findMany({
		include: {
			players: true,
			linkedAbilities: true
		}
	})
}

export const getAllRoles = async () => {
	return await database.role.findMany({
		include: {
			players: true
		}
	})
}

export const getAbility = async (
	name: string,
	createCustomIfNeeded: Player["id"] | false = false
) => {
	const ability = await database.ability.findFirst({
		where: {
			name
		},
		include: {
			playersWithAbility: true,
			linkedRoles: true,
			linkedItems: true
		}
	})
	if (!ability && createCustomIfNeeded) {
		const ability = await database.ability.create({
			data: {
				name,
				description: `${name}\n-# ||Generated from a one-off request||`,
				uses: 1,
				properties: 0,
				customOneOff: true,
				playersWithAbility: {}
			},
			include: {
				playersWithAbility: true,
				linkedRoles: true,
				linkedItems: true
			}
		})
		await database.playerAbilities.create({
			data: {
				player: {
					connect: {
						id: createCustomIfNeeded
					}
				},
				ability: {
					connect: {
						id: ability.id
					}
				},
				usesLeft: 1
			}
		})
	}
	return ability
}

export const getAbilitiesWithProperty = async (property: AbilityProperty) => {
	const abilities = await database.ability.findMany()
	return abilities.filter((ability) => hasProperty(ability, property))
}

export const getAllAbilities = async () => {
	return await database.ability.findMany({
		include: {
			playersWithAbility: true,
			linkedRoles: true
		}
	})
}

export const getPlayerAbility = async (
	playerName: string,
	abilityName: string
) => {
	return await database.playerAbilities.findFirst({
		where: {
			playerName,
			abilityName
		}
	})
}

export const getAllLocations = async () => {
	return await database.location.findMany({ include: { players: true } })
}

export const getLocation = async (name: string) => {
	return await database.location.findFirst({
		where: {
			name
		},
		include: {
			players: true
		}
	})
}
