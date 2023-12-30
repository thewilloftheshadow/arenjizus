import { PrismaClient } from "@prisma/client"
import { KiaiClient } from "kiai.js"
const database = new PrismaClient()

export default database

export * from "@prisma/client"

export const kiai = new KiaiClient("iOMIA83uuHFSL4p4i1X6LJOgCD6YVU")

export * from "./src/embeds.js"
export * from "./src/getData.js"
export * from "./src/thingys.js"
export * from "./src/ability.js"
