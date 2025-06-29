import { readFileSync } from "node:fs"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import {
	getAllWebPlayers,
	getItem,
	getRole,
	getAbility
} from "~/database/getData"
import { logger } from "~/logger"

const app = new Hono()

// Serve static files from dist directory
app.use("/*", serveStatic({ root: "./src/web/dist" }))

// API endpoint to get player data
app.get("/api/players", async (c) => {
	try {
		const players = await getAllWebPlayers()
		return c.json(players)
	} catch (error) {
		logger.error("Error fetching players:", error as Error)
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
		logger.error("Error fetching role:", error as Error)
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
		logger.error("Error fetching item:", error as Error)
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
		logger.error("Error fetching ability:", error as Error)
		return c.json({ error: "Failed to fetch ability" }, 500)
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
