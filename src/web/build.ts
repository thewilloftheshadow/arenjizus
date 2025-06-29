import { randomBytes } from "node:crypto"
import { mkdir, readFile, rmdir, writeFile } from "node:fs/promises"

// Parse --dev flag
const isDev = process.argv.includes("--dev")

async function buildWebAssets() {
	try {
		await rmdir("src/web/dist", { recursive: true }).catch(() => {})
		// Create dist directory if it doesn't exist
		await mkdir("src/web/dist", { recursive: true }).catch(() => {})

		// Generate a random hash for cache busting
		const hash = randomBytes(8).toString("hex")

		// Bundle the React app using Bun.build
		const result = await Bun.build({
			entrypoints: ["src/web/public/app.js"],
			outdir: "src/web/dist",
			target: "browser",
			minify: !isDev,
			sourcemap: isDev ? "inline" : "external",
			format: "esm",
			// Output file name with hash
			naming: {
				entry: `app.${hash}.js`
			}
		})

		if (!result.success) {
			console.error(
				"Build failed:",
				result.logs.map((l) => l.message).join("\n")
			)
			process.exit(1)
		}

		// Copy CSS file with hash
		const cssContent = await readFile("src/web/public/styles.css", "utf-8")
		await writeFile(`src/web/dist/styles.${hash}.css`, cssContent)

		// Write the hash to a file for the server to use
		await writeFile("src/web/dist/hash.json", JSON.stringify({ hash }), "utf-8")

		console.log(
			`Web assets built successfully! (${isDev ? "development" : "production"} mode, hash: ${hash})`
		)
	} catch (error) {
		console.error("Build failed:", error)
		process.exit(1)
	}
}

await buildWebAssets()
