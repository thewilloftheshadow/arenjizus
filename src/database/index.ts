import { PrismaClient } from "@prisma/client"
import { S3Client } from "bun"
import { KiaiClient } from "kiai.js"

const database = new PrismaClient()

export default database

export * from "@prisma/client"

export const kiai = new KiaiClient(process.env.KIAI_TOKEN!)

export const s3 = new S3Client({
	endpoint: "https://07c634e5b9f9eb260972946dc8e2f891.r2.cloudflarestorage.com",
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	bucket: "cdn-bucket"
})
