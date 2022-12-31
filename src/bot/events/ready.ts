import EventHandler from "../../../lib/classes/EventHandler"

export default class Ready extends EventHandler {
    override async run() {
        await this.client.application?.fetch()
        const allGuilds = await this.client.shard?.broadcastEval(async (c) =>
            c.guilds.cache.map((guild) => `${guild.name} [${guild.id}] - ${guild.memberCount} members.`))
        const guildsStringList: string[] = []
        // @ts-ignore
        for (let i = 0; i < allGuilds.length; i++) {
            // @ts-ignore
            guildsStringList.push(`Shard ${i + 1}\n${allGuilds[i].join("\n")}`)
        }
        const stats = await this.client.fetchStats()
        this.client.logger.info(
            `Logged in as ${this.client.user?.tag} [${this.client.user?.id}] with ${stats.guilds} guilds and ${stats.users} users.`
        )
    }
}
