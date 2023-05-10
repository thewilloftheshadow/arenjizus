import database, { Death, getPlayer } from "../index.js"

export const addMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name,
		},
		data: {
			money: player.money + amount,
		},
	})
}

export const removeMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name,
		},
		data: {
			money: player.money - amount,
		},
	})
}

export const setPlayerMoney = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name,
		},
		data: {
			money: amount,
		},
	})
}

export const givePlayerItem = async (playerName: string, itemName: string, amount: number) => {
	const player = await getPlayer(playerName)
	if (!player) return
	return await database.playerItems.upsert({
		where: {
			playerName_itemName: {
				playerName,
				itemName,
			},
		},
		create: {
			playerName,
			itemName,
			amount,
		},
		update: {
			amount: {
				increment: amount,
			},
		},
	})
}

export const removePlayerItem = async (playerName: string, itemName: string, amount: number) => {
	const player = await getPlayer(playerName)
	if (!player) return
	return await database.playerItems.upsert({
		where: {
			playerName_itemName: {
				playerName,
				itemName,
			},
		},
		create: {
			playerName,
			itemName,
			amount,
		},
		update: {
			amount: {
				decrement: amount,
			},
		},
	})
}

export const givePlayerRole = async (playerName: string, roleName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return
	return await database.playerRoles.upsert({
		where: {
			playerName_roleName: {
				playerName,
				roleName,
			},
		},
		create: {
			playerName,
			roleName,
		},
		update: {},
	})
}

export const removePlayerRole = async (playerName: string, roleName: string) => {
	const player = await getPlayer(playerName)
	if (!player) return
	return await database.playerRoles.delete({
		where: {
			playerName_roleName: {
				playerName,
				roleName,
			},
		},
	})
}

export const deleteItem = async (name: string) => {
	await database.playerItems.deleteMany({
		where: {
			itemName: name,
		},
	})
	await database.item.delete({
		where: {
			name,
		},
	})
}

export const toggleDeath = async (name: string, status: Death) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name,
		},
		data: {
			deathStatus: status,
		},
	})
}

export const setVoteWorth = async (name: string, amount: number) => {
	const player = await getPlayer(name)
	if (!player) return
	await database.player.update({
		where: {
			name,
		},
		data: {
			voteWorth: amount,
		},
	})
}

export const setVote = async (name: string, votedFor: string | null) => {
	const player = await getPlayer(name)
	if (!player) return
	if (votedFor === null) {
		await database.player.update({
			where: {
				name,
			},
			data: {
				votedForName: null,
			},
		})
	} else {
		const votedForPlayer = await getPlayer(votedFor)
		if (!votedForPlayer) return
		await database.player.update({
			where: {
				name,
			},
			data: {
				votedForName: votedForPlayer.name,
			},
		})
	}
}
