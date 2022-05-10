import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default withApiAuthRequired(async function handler(req, res) {
    if (!req.method == "GET") res.status(405).end()
    const session = await getSession(req, res)
    let account = await prisma.account.findFirst({
        where: {
            id: session.user.sub,
        },
    })

    if (!account) {
        account = await prisma.account.create({
            data: {
                id: session.user.sub,
                email: session.user.email,
                name: session.user.name,
            },
        })
    }

    let player = await prisma.player.findFirst({
        where: {
            accountId: session.user.sub,
        },
    })

    res.status(200).json({ account, player, session })
})
