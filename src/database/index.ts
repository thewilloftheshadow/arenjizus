import { PrismaClient } from "@prisma/client"
import { KiaiClient } from "kiai.js"

const database = new PrismaClient()

export default database

export * from "@prisma/client"

export const kiai = new KiaiClient(
	"aGl0aGVyZTU3NDAxMDQyOTYwMTIxODU2MA==.iOMIA83uuHFSL4p4i1X6LJOgCD6YVU",
	{
		baseURL: "https://api-v1.kiai.app",
		fetchFunction: fetch
	}
)
