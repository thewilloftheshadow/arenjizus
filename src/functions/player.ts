import type { TextChannel } from "discord.js"
import type { Client } from "discord.js"
import { serverIds } from "~/config"

export const getPlayerChannel = async (name: string, client: Client) => {
	const guild = client.guilds.cache.get(serverIds.guild)
	return guild?.channels.cache.find(
		(c) => c.name === `gm-${name.toLowerCase().replace(/ /g, "-")}`
	) as TextChannel | null
}
