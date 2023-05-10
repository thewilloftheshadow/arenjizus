import { PrismaClient } from "@prisma/client"
const database = new PrismaClient()

export default database

export * from "@prisma/client"

export * from "./src/embeds.js"
export * from "./src/getData.js"
export * from "./src/thingys.js"
