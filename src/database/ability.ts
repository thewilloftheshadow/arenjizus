import { Result } from "@sapphire/result"
import database, { type Ability } from "~/database"
import { getAbility, getPlayer } from "./getData"

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
					abilityName
				}
			},
			create: {
				playerName,
				abilityName,
				usesLeft: ability.uses
			},
			update: {
				usesLeft: {
					set: ability.uses
				}
			}
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to grant ability")
		})
	return Result.ok(link)
}

export const revokeAbility = async (
	playerName: string,
	abilityName: string
) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities
		.delete({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName
				}
			}
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
			abilityName: ability.name
		}
	})
	for (const link of links) {
		await database.playerAbilities
			.update({
				where: {
					playerName_abilityName: {
						playerName: link.playerName,
						abilityName: link.abilityName
					}
				},
				data: {
					usesLeft: ability.uses
				}
			})
			.catch((e) => {
				console.error(e)
				return Result.err(
					`Failed to reset ability uses for ${link.playerName} with ${link.abilityName}`
				)
			})
	}
	return links
}

export const resetAbilityUses = async (
	playerName: string,
	abilityName: string,
	override?: number
) => {
	const player = await getPlayer(playerName)
	if (!player) return Result.err("Player not found")
	const ability = await getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	const link = await database.playerAbilities
		.update({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName
				}
			},
			data: {
				usesLeft: override || ability.uses
			}
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to reset ability uses")
		})
	return Result.ok(link)
}

export const queueAbility = async (abilityId: string) => {
	const ability = await database.playerAbilities.findFirst({
		where: {
			id: abilityId
		},
		include: {
			player: true,
			ability: true
		}
	})
	if (!ability) return Result.err("Ability not found")
	const queue = await database.abilityQueue
		.upsert({
			where: {
				abilityId
			},
			create: {
				abilityId
			},
			update: {}
		})
		.catch((e) => {
			console.error(e)
			return Result.err("Failed to queue ability")
		})
	return Result.ok({ abilityId, queue })
}

export enum AbilityProperty {
	resetWithDay = 1 << 0,
	lockDayChat = 1 << 1,
	killTarget = 1 << 2,
	resurrectTarget = 1 << 3,
	giveToTarget = 1 << 4,
	muteSelfInDayChat = 1 << 5,
	resetWithPhase = 1 << 6,
	resetWithNight = 1 << 7
}

export const getPropertyDetails = (properties: number | AbilityProperty[]) => {
	const props =
		typeof properties === "number"
			? convertNumberToProperties(properties)
			: properties
	const result = [] as descriptionsType[]
	for (const property of props) {
		result.push(propertyDetails[property])
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
		const num = Number.parseInt(key)
		if (permissions & num) result.push(num)
	}
	return result
}

export const setPropertiesForAbility = async (
	abilityName: string,
	properties: AbilityProperty[] | number
) => {
	const ability = getAbility(abilityName)
	if (!ability) return Result.err("Ability not found")
	await database.ability.update({
		where: {
			name: abilityName
		},
		data: {
			properties:
				typeof properties === "number"
					? properties
					: convertPropertiesToNumber(properties)
		}
	})
}

export const hasProperty = (ability: Ability, property: AbilityProperty) => {
	return (ability.properties & property) === property
}

const propertyDetails: { [key: number]: descriptionsType } = {
	[AbilityProperty.resetWithDay]: {
		name: "Reset with Day",
		description: "This ability's use count resets when day starts",
		value: AbilityProperty.resetWithDay
	},
	[AbilityProperty.resetWithPhase]: {
		name: "Reset with Phase Change",
		description: "This ability's use count resets when day or night starts",
		value: AbilityProperty.resetWithPhase
	},
	[AbilityProperty.resetWithNight]: {
		name: "Reset with Night",
		description: "This ability's use count resets when night starts",
		value: AbilityProperty.resetWithNight
	},
	[AbilityProperty.killTarget]: {
		name: "Kills Target",
		description: "This ability kills its target",
		value: AbilityProperty.killTarget
	},
	[AbilityProperty.resurrectTarget]: {
		name: "Resurrects Target",
		description: "This ability resurrects its target",
		value: AbilityProperty.resurrectTarget
	},
	[AbilityProperty.giveToTarget]: {
		name: "Give to Target",
		description: "This ability gives its target 1 use of the ability",
		value: AbilityProperty.giveToTarget
	},
	[AbilityProperty.muteSelfInDayChat]: {
		name: "Mute Self in Day Chat",
		description: "This ability mutes the user in day chat",
		value: AbilityProperty.muteSelfInDayChat
	},
	[AbilityProperty.lockDayChat]: {
		name: "Locks Day Chat",
		description: "This ability locks the day chat",
		value: AbilityProperty.lockDayChat
	}
} as const

export type descriptionsType = {
	name: string
	description: string
	value: number
}

const allProperties = Object.keys(AbilityProperty)
	.map((k) => AbilityProperty[k as keyof typeof AbilityProperty])
	.reduce((a, b) => a | b)

export { allProperties }
