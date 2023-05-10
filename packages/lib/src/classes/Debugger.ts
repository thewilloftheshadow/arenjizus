import { logger } from "@internal/logger"
import { Snowflake } from "discord.js"
import { BetterClient } from "../../index.js"

const divider = "\n========================================\n"

export default class Debugger {
	private client: BetterClient
	constructor(client: BetterClient) {
		this.client = client
	}

	public debugReport = async (key: string, data: { guildId?: Snowflake; userId?: Snowflake }) => {
		logger.null(divider, key, data, this.client)
		return "Not yet implemented"
		// const guild = data.guildId ? await this.client.guilds.resolve(data.guildId) : null
		// const user = data.userId ? await this.client.users.fetch(data.userId) : null

		// this.client.hasteLog(key, `Debug report ${guild ? `for ${guild.name} (${guild.id})` : `manually generated by developers (${data})`}`)
		// this.client.hasteLog(key, `Generated at ${new Date().toISOString()}`)
		// this.client.hasteLog(key, divider)

		// if (guild) {
		//     const guildSettings = await database.guild.findFirst({
		//         where: {
		//             id: guild.id,
		//         },
		//         include: {
		//             slot: true,
		//             panels: true,
		//         },
		//     })
		//     this.client.hasteLog(key, `Guild Settings: \n${JSON.stringify(guildSettings, null, 4)}`)
		//     this.client.hasteLog(key, `Bot's Permissions: \n${JSON.stringify(guild.members.me?.permissions.toArray(), null, 4)}`)
		//     this.client.hasteLog(key, divider)

		//     const guildExperiments = await Promise.all(
		//         this.client.experimentManager.experiments.map(
		//             async (x) =>
		//                 `${x.name} (${x.featureKey}:${x.id}) - ${await this.client.experimentManager.checkExperimentAccess(x.featureKey, guild.id)}`
		//         )
		//     )

		//     this.client.hasteLog(key, `Guild Experiments: \n\n${guildExperiments.join("\n")}`)
		//     this.client.hasteLog(key, divider)
		// }
		// if (user) {
		//     const userData = await database.user.findFirst({
		//         where: {
		//             id: user.id,
		//         },
		//         include: {
		//             slots: true,
		//         },
		//     })
		//     this.client.hasteLog(key, `User Data: \n${JSON.stringify(userData, null, 4)}`)
		// }

		// if (user && guild) {
		//     const member = await guild.members.fetch(user.id)
		//     this.client.hasteLog(key, `\nMember Roles:\n${member.roles.cache.map((x) => `${x.name} - ${x.id}`).join("\n")}`)
		//     this.client.hasteLog(key, `\nMember Permissions: ${JSON.stringify(member.permissions.toArray(), null, 4)}`)
		// }

		// this.client.hasteLog(key, divider)
		// this.client.hasteLog(key, "Client Data:")
		// this.client.hasteLog(key, `Shard: ${this.client.shard?.ids[0]}`)
		// this.client.hasteLog(key, `API Latency: ${this.client.ws.ping}ms`)

		// const haste = await this.client.hasteFlush(key)
		// return haste
	}
}
