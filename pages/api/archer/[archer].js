import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default async function handler(req, res) {
    let { archer } = req.query
    let data
    archer = parseInt(archer)

    if (!archer)
        res.status(500).send({ message: "A valid archer ID was not provided" })
    if (!data) res.status(404)

    if (req.method == "GET") {
        let data = await prisma.archer.findFirst({
            where: {
                id: archer,
            },
        })

        if (!data) return res.status(404).send({ message: "No archer found" })

        let scores = await prisma.score.findMany({
            where:{
                archerId: archer
            }
        })

        return res.status(200).send({archer: data, scores})
    } else if (req.method == "PATCH") {
        res.status(204).end()
    } else {
        return res.status(405).end()
    }
}
