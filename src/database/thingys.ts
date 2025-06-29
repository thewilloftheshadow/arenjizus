import { Result } from "@sapphire/result"
import { type Client, EmbedBuilder } from "discord.js"
import { serverIds } from "~/config"
import database, { type Ability } from "~/database"
import { logger } from "~/logger"
import {
	AbilityProperty,
	convertNumberToProperties,
	grantAbility
} from "./ability"
import {
	getAbility,
	getAllPlayers,
	getItem,
	getPlayer,
	getPlayerAbility,
	getRole
} from "./getData"

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

export const toggleDeath = async (
	name: string,
	isAlive: boolean,
	faked?: boolean
) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name
		},
		data: {
			isAlive,
			isFaked: isAlive ? false : faked
		}
	})
}

export const syncDeathRoles = async (client: Client) => {
	const players = await getAllPlayers()
	const guild = await client.guilds.fetch(serverIds.guild)
	players.map(async (player) => {
		if (player.discordId) {
			if (player.isAlive) {
				await guild.members
					.resolve(player.discordId)
					?.roles.remove(serverIds.roles.dead)
					.catch(() => {})
				await guild.members
					.resolve(player.discordId)
					?.roles.add(serverIds.roles.player)
					.catch(() => {})
			} else {
				await guild.members
					.resolve(player.discordId)
					?.roles.remove(serverIds.roles.player)
					.catch(() => {})
				await guild.members
					.resolve(player.discordId)
					?.roles.add(serverIds.roles.dead)
					.catch(() => {})
			}
		}
	})
}

export const playerListUpdate = async (client: Client) => {
	const guild = await client.guilds.fetch(serverIds.guild)
	if (!guild)
		throw new Error(
			`Primary guild ${serverIds.guild} not found for player list update`
		)
	const allChannels = await guild.channels.fetch()
	const playerListChannel = allChannels.find(
		(c) => c && c.name === "player-list"
	)
	if (!playerListChannel || !playerListChannel.isSendable()) return
	const players = await getAllPlayers()

	const embed = new EmbedBuilder()
		.setTitle("All Players")
		.setDescription("\n")
		.setFooter({
			text: `${players.filter((x) => x.isAlive).length} alive, ${
				players.filter((x) => !x.isAlive).length
			} dead`
		})
	players
		.sort((a, b) => {
			if (a.name < b.name) {
				return -1
			}
			if (a.name > b.name) {
				return 1
			}
			return 0
		})
		.forEach((player) => {
			const deathEmoji = player.isAlive ? "😃" : !player.isAlive ? "💀" : "??"
			embed.data.description += `${deathEmoji} ${player.name}\n`
		})

	const mId = (
		await database.keyV.findFirst({
			where: {
				key: "playerListMessageId"
			}
		})
	)?.value
	if (mId) {
		const m = await playerListChannel.messages.fetch(mId)
		if (m) {
			await m.edit({ embeds: [embed] })
		} else {
			await playerListChannel.send({ embeds: [embed] })
		}
	} else {
		await playerListChannel.send({ embeds: [embed] })
	}
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
	await database.abilityQueue
		.delete({
			where: {
				abilityId: playerLink.id
			}
		})
		.catch(() => {})

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
			await toggleDeath(targetName, false)
			result.push(`Killed ${targetName}`)
		} else if (property === AbilityProperty.resurrectTarget) {
			if (!target) return ["Target not found"]
			await toggleDeath(targetName, true)
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
			const channel = client.channels.resolve(dayChat.value)
			if (!channel || !channel.isSendable()) {
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
