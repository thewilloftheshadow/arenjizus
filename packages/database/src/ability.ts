import { Result } from "@sapphire/result"
import database, { Ability, getAbility, getPlayer } from "../index.js"

export const useAbility = async (playerName: string, abilityName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities.findFirst({
		where: {
			playerName,
			abilityName,
		},
	})
	if (!link) return Result.err("Player does not have this ability")
	if (link.usesLeft <= 0) return Result.err("Player has no uses left")
	await database.playerAbilities.update({
		where: {
			playerName_abilityName: {
				playerName,
				abilityName,
			},
		},
		data: {
			usesLeft: {
				decrement: 1,
			},
		},
	})
	return Result.ok(link)
}

export const grantAbility = async (playerName: string, abilityName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities
		.upsert({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName,
				},
			},
			create: {
				playerName,
				abilityName,
				usesLeft: ability.uses,
			},
			update: {
				usesLeft: {
					set: ability.uses,
				},
			},
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to grant ability")
		})
	return Result.ok(link)
}

export const revokeAbility = async (playerName: string, abilityName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities
		.delete({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName,
				},
			},
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to revoke ability")
		})
	return Result.ok(link)
}

export const resetAllAbilityUses = async (ability: Ability) => {
	const links = await database.playerAbilities.findMany({
		where: {
			abilityName: ability.name,
		},
	})
	for (const link of links) {
		await database.playerAbilities
			.update({
				where: {
					playerName_abilityName: {
						playerName: link.playerName,
						abilityName: link.abilityName,
					},
				},
				data: {
					usesLeft: ability.uses,
				},
			})
			.catch((e) => {
				console.error(e)
				return Result.err("Failed to reset ability uses")
			})
	}
	return Result.ok(links)
}

export const resetAbilityUses = async (playerName: string, abilityName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities
		.update({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName,
				},
			},
			data: {
				usesLeft: ability.uses,
			},
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to reset ability uses")
		})
	return Result.ok(link)
}

export enum AbilityProperty {
	"resetWithDay" = 1 << 0,
	"hasTarget" = 1 << 1,
	"killTarget" = 1 << 2,
	"resurrectTarget" = 1 << 3,
	"giveToTarget" = 1 << 4,
	"muteSelfInDayChat" = 1 << 5,
	"lockDayChat" = 1 << 6,
}

export const getPropertyDescriptions = (properties: number | AbilityProperty[]) => {
	if (typeof properties === "number") properties = convertNumberToProperties(properties)
	const result = [] as string[]
	for (const property of properties) {
		result.push(propertyDescriptions[property])
	}
	return result
}

export const convertPropertiesToNumber = (properties: AbilityProperty[]) => {
	let result = 0
	for (const property of properties) {
		result |= property
	}
	return result
}

export const convertNumberToProperties = (permissions: number) => {
	const result = [] as AbilityProperty[]
	for (const [key, _] of Object.entries(AbilityProperty)) {
		const num = parseInt(key)
		if (permissions & num) result.push(num)
	}
	return result
}

export const setPropertiesForAbility = async (abilityName: string, properties: AbilityProperty[]) => {
	const ability = getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	await database.ability.update({
		where: {
			name: abilityName,
		},
		data: {
			properties: convertPropertiesToNumber(properties),
		},
	})
}

export const hasProperty = (ability: Ability, property: AbilityProperty) => {
	return (ability.properties & property) === property
}

const propertyDescriptions = {
	[AbilityProperty.resetWithDay]: "Reset the use count of this ability when day starts",
	[AbilityProperty.hasTarget]: "This ability has a target",
	[AbilityProperty.killTarget]: "This ability kills its target",
	[AbilityProperty.resurrectTarget]: "This ability resurrects its target",
	[AbilityProperty.giveToTarget]: "This ability gives its target an item",
	[AbilityProperty.muteSelfInDayChat]: "This ability mutes the user in day chat",
	[AbilityProperty.lockDayChat]: "This ability locks the day chat",
} as const

export type descriptionsType = {
	-readonly [key in keyof typeof propertyDescriptions]: (typeof propertyDescriptions)[key]
}

export const getPropertyDescription = (permissions: number): descriptionsType => {
	const result = {} as descriptionsType
	for (const [key, _] of Object.entries(propertyDescriptions)) {
		const num = parseInt(key)
		// @ts-ignore I'm not sure why this errors but its working properly
		if (permissions & num) result[num] = permissionDescriptions[num]
	}
	return result
}

const allAbilities = Object.keys(AbilityProperty)
	.map((k) => AbilityProperty[k as keyof typeof AbilityProperty])
	.reduce((a, b) => a | b)

export { allAbilities }
