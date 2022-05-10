import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req, res) {
    let { event } = req.query
    let data
    event = parseInt(event)

    if (!event)
        res.status(500).send({ message: "A valid event ID was not provided" })
    if (!data) res.status(404)

    if (req.method == "GET") {
        let data = await prisma.event.findFirst({
            where: {
                id: event,
            },
        })

        if (!data) return res.status(404).send({ message: "No event found" })
        let scores = await prisma.score.findMany({
            where: {
                eventId: event,
            },
        })
        return res.status(200).send({ event: data, scores })
    } else if (req.method == "PATCH") {
        res.status(204).end()
    } else {
        return res.status(405).end()
    }
}
