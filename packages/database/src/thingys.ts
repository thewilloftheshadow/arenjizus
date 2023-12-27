import { logger } from "@internal/logger"
import { Result } from "@sapphire/result"
import { Client, TextBasedChannel } from "discord.js"
import database, {
	Ability,
	AbilityProperty,
	Death,
	convertNumberToProperties,
	getAbility,
	getItem,
	getPlayer,
	getPlayerAbility,
	getRole,
	grantAbility
} from "../index.js"

export const addMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			money: player.money + amount
		}
	})
}

export const removeMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			money: player.money - amount
		}
	})
}

export const setPlayerMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			money: amount
		}
	})
}

export const givePlayerItem = async (
	playerName: string,
	itemName: string,
	amount: number
) => {
	const player = await getPlayer(playerName)
	if (!player) return
	const item = await getItem(itemName)
	if (!item) return
	const done = await database.playerItems.upsert({
		where: {
			playerName_itemName: {
				playerName,
				itemName
			}
		},
		create: {
			playerName,
			itemName,
			amount
		},
		update: {
			amount: {
				increment: amount
			}
		}
	})
	if (item.linkedAbilities.length > 0) {
		for (const abilityLink of item.linkedAbilities) {
			if (!abilityLink.giveWithItem) continue
			const ability = await getAbility(abilityLink.abilityName)
			if (!ability) continue
			await database.playerAbilities.upsert({
				where: {
					playerName_abilityName: {
						playerName,
						abilityName: ability?.name
					}
				},
				create: {
					playerName,
					abilityName: ability?.name,
					usesLeft: ability?.uses
				},
				update: {
					usesLeft: {
						increment: ability.uses
					}
				}
			})
		}
	}
	return done
}

export const removePlayerItem = async (
	playerName: string,
	itemName: string,
	amount: number
) => {
	const player = await getPlayer(playerName)
	if (!player) return
	const item = await getItem(itemName)
	if (!item) return
	const done = await database.playerItems.upsert({
		where: {
			playerName_itemName: {
				playerName,
				itemName
			}
		},
		create: {
			playerName,
			itemName,
			amount
		},
		update: {
			amount: {
				decrement: amount
			}
		}
	})
	return done
}

export const givePlayerRole = async (playerName: string, roleName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return
	const role = await getRole(roleName)
	if (!role) return
	const done = await database.playerRoles.upsert({
		where: {
			playerName_roleName: {
				playerName,
				roleName
			}
		},
		create: {
			playerName,
			roleName
		},
		update: {}
	})
	if (role.linkedAbilities.length > 0) {
		for (const abilityLink of role.linkedAbilities) {
			const ability = await getAbility(abilityLink.abilityName)
			if (!ability) continue
			await database.playerAbilities.upsert({
				where: {
					playerName_abilityName: {
						playerName,
						abilityName: ability?.name
					}
				},
				create: {
					playerName,
					abilityName: ability?.name,
					usesLeft: ability?.uses
				},
				update: {
					usesLeft: {
						increment: ability.uses
					}
				}
			})
		}
	}
	return done
}

export const removePlayerRole = async (
	playerName: string,
	roleName: string
) => {
	const player = await getPlayer(playerName)
	if (!player) return
	return await database.playerRoles.delete({
		where: {
			playerName_roleName: {
				playerName,
				roleName
			}
		}
	})
}

export const deleteItem = async (name: string) => {
	await database.playerItems.deleteMany({
		where: {
			itemName: name
		}
	})
	await database.item.delete({
		where: {
			name
		}
	})
}

export const toggleDeath = async (name: string, status: Death) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			deathStatus: status
		}
	})
}

export const setVoteWorth = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			voteWorth: amount
		}
	})
}

export const setVote = async (name: string, votedFor: string | null) => {
	const player = await getPlayer(name)
	if (!player) return
	if (votedFor === null) {
		await database.player.update({
			where: {
				name
			},
			data: {
				votedForName: null
			}
		})
	} else {
		const votedForPlayer = await getPlayer(votedFor)
		if (!votedForPlayer) return
		await database.player.update({
			where: {
				name
			},
			data: {
				votedForName: votedForPlayer.name
			}
		})
	}
}

export const createAbility = async (
	name: string,
	description: string,
	uses: number
) => {
	const exists = await getAbility(name)
	if (exists) return Result.err("Ability already exists")
	const result = await database.ability
		.create({
			data: {
				name,
				description,
				uses
			}
		})
		.catch(() => {
			return Result.err("Failed to create ability")
		})
	return Result.ok(result)
}

export const deleteAbility = async (name: string) => {
	await database.ability.delete({
		where: {
			name
		}
	})
}

export const useAbility = async (playerName: string, abilityName: string) => {
	const ability = await getAbility(abilityName)
	if (!ability) return
	const playerLink = await getPlayerAbility(playerName, abilityName)
	if (!playerLink) return
	if (playerLink.usesLeft - 1 <= 0) {
		await database.playerAbilities.delete({
			where: {
				playerName_abilityName: {
					playerName,
					abilityName
				}
			}
		})
		return
	}
	await database.playerAbilities.update({
		where: {
			playerName_abilityName: {
				playerName,
				abilityName
			}
		},
		data: {
			usesLeft: {
				decrement: 1
			}
		}
	})

	if (ability.linkedItems.length > 0) {
		for (const itemLink of ability.linkedItems) {
			if (!itemLink.subtractItemOnUse) continue
			const item = await getItem(itemLink.itemName)
			if (!item) continue
			await database.playerItems.update({
				where: {
					playerName_itemName: {
						playerName,
						itemName: item.name
					}
				},
				data: {
					amount: {
						decrement: 1
					}
				}
			})
		}
	}
}

export const runAbilityProperties = async (
	ability: Ability,
	targetName: string,
	client: Client
) => {
	const properties = convertNumberToProperties(ability.properties)
	const target = await getPlayer(targetName)
	const result: string[] = []
	for (const property of properties) {
		if (property === AbilityProperty.giveToTarget) {
			if (!target) return ["Target not found"]
			const done = await grantAbility(targetName, ability.name)
			if (done.isErr()) result.push(done.unwrapErr())
			else result.push(`Gave ${targetName} ${ability.name}`)
		} else if (property === AbilityProperty.killTarget) {
			if (!target) return ["Target not found"]
			await toggleDeath(targetName, Death.DEAD)
			result.push(`Killed ${targetName}`)
		} else if (property === AbilityProperty.resurrectTarget) {
			if (!target) return ["Target not found"]
			await toggleDeath(targetName, Death.ALIVE)
			result.push(`Resurrected ${targetName}`)
		} else if (property === AbilityProperty.lockDayChat) {
			const dayChat = await database.keyV.findFirst({
				where: {
					key: "dayChat"
				}
			})
			if (!dayChat?.value) {
				result.push("Day chat not found")
				continue
			}
			const channel = client.channels.resolve(dayChat.value) as TextBasedChannel
			if (!channel) {
				result.push("Day chat not found")
				continue
			}
			const m = await channel
				.send(
					"🔒 An emergency meeting has been called! The chat is now locked! 🔒"
				)
				.catch(() => {})
			if (!m) {
				result.push("Failed to send message")
				continue
			}
			result.push(`Day chat has been locked`)
		} else if (property === AbilityProperty.muteSelfInDayChat) {
			result.push(`The player now needs to be muted in day chat`)
		}
	}
	logger.null(target, client)
	return result
}
