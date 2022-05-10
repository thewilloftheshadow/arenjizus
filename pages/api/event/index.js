import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (req.method == "PUT") {
        let name = req.body.name
        if (!name || typeof name != "string")
            return res.status(400).send({
                message: "The name of the event must be a string",
            })

        let date = req.body.date
        if (!date || typeof date != "string")
            return res.status(400).send({
                message: "The date of the event must be a string",
            })

        let description = req.body.description
        if (description && typeof description != "string")
            return res.status(400).send({
                message: "The description of the event must be a string",
            })

        let location = req.body.location
        if (location && typeof location != "string")
            return res.status(400).send({
                message: "The location of the event must be a string",
            })

        let event = await prisma.event.create({
            data: {
                name,
                date,
                description,
                location,
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
    } else {
        res.status(405).end()
    }
}
