import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export default withApiAuthRequired(async function handler(req, res) {
    const { user } = await getSession(req, res)

    let archers = await prisma.archer.findMany({
        where: {
            accountId: user.sub,
        },
    })

    res.send(archers ?? {})
})
