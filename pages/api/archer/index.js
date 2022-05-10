import { getSession } from "@auth0/nextjs-auth0"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (!["PUT", "DELETE"].includes(req.method)) return res.status(405).end()

    let session = await getSession(req, res)
    if (!session) return res.status(401).end()

    let account = await prisma.account.findFirst({
        where: {
            id: session.user.sub,
        },
    })

    if (!account) return res.status(401).end()

    if (req.method == "PUT") {
        let name = req.body.name
        if (!name || typeof name != "string")
            return res.status(400).send({
                message: "The name of the archer must be a string",
            })

        let event = await prisma.archer.create({
            data: {
                name,
                accountId: account.id
            },
        })

        return res.status(200).json(event)
    } else if (req.method == "DELETE") {
        let id = parseInt(req.query.id)
        if (!id)
            res.status(400).send({
                message: "The id must be a valid integer",
            })

        let event = await prisma.event.delete({ where: { id } })

        res.status(200).send({ message: "Event successfully deleted", event })
    }
}
