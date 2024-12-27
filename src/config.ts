import {
	GatewayIntentBits,
	PermissionFlagsBits,
	PermissionsBitField
} from "discord.js"

export const prefix = "!"

export const botName = "Arenjizus"
export const admins = ["439223656200273932", "461298571786977309"]

export const serverIds = {
	inGameCategories: [
		"1105539808874475535",
		"1105667412164087888",
		"1191072093102670004"
	],
	roles: {
		dead: "1105539807444217871",
		muted: "1105539807444217870",
		player: "1105539807444217869",
		kidnapped: "1105539807444217867",
		spectator: "1105539807444217868",
		gamemaster: "1105539807444217873"
	},
	guild: "1105539807444217866"
}

export const colors = {
	primary: 0xd8833b,
	success: 0x57f287,
	warning: 0xfee75c,
	error: 0xed4245,
	invisible: 0x2f3136
}

export const intents = [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.GuildWebhooks,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
	GatewayIntentBits.GuildMessageReactions
]

export const requiredPermissions = new PermissionsBitField([
	PermissionFlagsBits.EmbedLinks,
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.UseExternalEmojis
])

export const embedSpacer = "https://cdn.animeinterlink.com/r/embed_spacer.png"
export const emojiSpacer = "<:spacer:991733061182038178>"
