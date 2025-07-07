import { readFileSync } from "node:fs"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { gameConfig } from "~/config"
import database, { Investment, KeyV } from "~/database"
import {
	getAbility,
	getAllItems,
	getAllLocations,
	getAllRoles,
	getAllVotes,
	getAllWebPlayers,
	getItem,
	getRole
} from "~/database/getData"
import { logger } from "~/logger"

export type DashboardData = {
	config: KeyV[]
	wanted: {
		name: string | null
		price: number | null
	}
	investments: Investment[]
	items: Awaited<ReturnType<typeof getAllItems>>
	roles: Awaited<ReturnType<typeof getAllRoles>>
	votes: Awaited<ReturnType<typeof getAllVotes>>
	locations: Awaited<ReturnType<typeof getAllLocations>>
}

const app = new Hono()

// Serve avatars statically
app.use("/avatars/*", serveStatic({ root: "./avatars" }))

// Serve static files from dist directory
app.use("/*", serveStatic({ root: "./src/web/dist" }))

// API endpoint to get player data
app.get("/api/players", async (c) => {
	try {
		const players = await getAllWebPlayers()
		return c.json(players)
	} catch (error) {
		logger.error("Error fetching players")
		console.error(error)
		return c.json({ error: "Failed to fetch players" }, 500)
	}
})

// API endpoint to get role details
app.get("/api/role/:name", async (c) => {
	const name = c.req.param("name")
	try {
		const role = await getRole(name)
		if (!role) {
			return c.json({ error: `Role '${name}' not found` }, 404)
		}
		return c.json(role)
	} catch (error) {
		logger.error("Error fetching role")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch role" }, 500)
	}
})

// API endpoint to get item details
app.get("/api/item/:name", async (c) => {
	const name = c.req.param("name")
	try {
		const item = await getItem(name)
		if (!item) {
			return c.json({ error: `Item '${name}' not found` }, 404)
		}
		return c.json(item)
	} catch (error) {
		logger.error("Error fetching item")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch item" }, 500)
	}
})

// API endpoint to get ability details
app.get("/api/ability/:name", async (c) => {
	const name = c.req.param("name")
	try {
		const ability = await getAbility(name)
		if (!ability) {
			return c.json({ error: `Ability '${name}' not found` }, 404)
		}
		return c.json(ability)
	} catch (error) {
		logger.error("Error fetching ability")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch ability" }, 500)
	}
})

// API endpoint to get all items
app.get("/api/items", async (c) => {
	try {
		const items = await getAllItems()
		return c.json(items)
	} catch (error) {
		logger.error("Error fetching items")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch items" }, 500)
	}
})

// API endpoint to get all roles
app.get("/api/roles", async (c) => {
	try {
		const roles = await getAllRoles()
		return c.json(roles)
	} catch (error) {
		logger.error("Error fetching roles")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch roles" }, 500)
	}
})

// API endpoint to get game config
app.get("/api/dashboard", async (c) => {
	try {
		const kv = await database.keyV.findMany()
		const config = kv.filter((c) => gameConfig.some((g) => g.key === c.key))
		const wantedPlayer = kv.find((c) => c.key === "wantedPlayer")
		const wantedPrice = kv.find((c) => c.key === "wantedPrice")
		const investments = await database.investment.findMany({
			where: { expiresAt: { gt: new Date() } }
		})
		const items = await getAllItems()
		const roles = await getAllRoles()
		const votes = await getAllVotes()
		const locations = await getAllLocations()
		return c.json<DashboardData>({
			config,
			wanted: {
				name: wantedPlayer?.value ?? null,
				price: wantedPrice?.valueInt ?? null
			},
			investments,
			items,
			roles,
			votes,
			locations
		})
	} catch (error) {
		logger.error("Error fetching dashboard data")
		console.error(error as Error)
		return c.json({ error: "Failed to fetch dashboard data" }, 500)
	}
})

// Read the hash from the build output
let hash = ""
try {
	hash = JSON.parse(readFileSync("src/web/dist/hash.json", "utf-8")).hash
} catch (e) {
	console.error("Failed to read hash.json. Did you run the build?", e)
}

// Serve the main page
app.get("/", (c) => {
	return c.html(`
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Database Live View</title>
			<link rel="stylesheet" href="/styles.${hash}.css">
		</head>
		<body>
			<div id="root"></div>
			<script type="module" src="/app.${hash}.js"></script>
		</body>
		</html>
	`)
})

const port = process.env.WEB_PORT
	? Number.parseInt(process.env.WEB_PORT, 10)
	: 3000

export default {
	port,
	fetch: app.fetch
}

logger.info(`Web server starting on port ${port}`)
