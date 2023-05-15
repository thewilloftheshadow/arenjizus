import { serverIds } from "@internal/config"
import { ChannelType, Client, TextChannel } from "discord.js"

export const getPlayerChannel = async (name: string, client: Client) => {
	name = name.toLowerCase().replace(/ /g, "-")

	const guild = await client.guilds.fetch(serverIds.guild)

	if (!guild) return null

	await guild.channels.fetch()

	const channel = guild.channels.cache.find((channel) => {
		name === channel.name.toLowerCase() && channel.type === ChannelType.GuildText
	})

	if (!channel) return null

	return channel as TextChannel
}
