import type { Prisma } from "@prisma/client"

export type RoleWithPlayers = Prisma.RoleGetPayload<{
	include: {
		players: {
			select: {
				playerName: true
			}
		}
	}
}>

export type ItemWithPlayers = Prisma.ItemGetPayload<{
	include: {
		players: {
			select: {
				playerName: true
				amount: true
			}
		}
	}
}>

export type PlayerWithRelations = Prisma.PlayerGetPayload<{
	include: {
		location: true
		roles: {
			include: {
				role: true
			}
		}
		items: {
			include: {
				item: true
			}
		}
	}
}>

export type Players = PlayerWithRelations[]

export type WebPlayer = Omit<PlayerWithRelations, "roles" | "items"> & {
	roles: string[]
	items: { name: string; amount: number }[]
}
