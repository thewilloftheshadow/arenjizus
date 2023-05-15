import { serverIds } from "@internal/config"
import { TextChannel } from "discord.js"
import { Client } from "discord.js"

export const getPlayerChannel = async (name: string, client: Client) => {
	const guild = client.guilds.cache.get(serverIds.guild)
	return guild?.channels.cache.find((c) => c.name === `gm-${name.toLowerCase().replace(/ /g, "-")}`) as TextChannel | null
}
	