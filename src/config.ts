import {
	GatewayIntentBits,
	PermissionFlagsBits,
	PermissionsBitField
} from "discord.js"

export const gameConfig: {
	key: string
	type: "string" | "integer" | "boolean"
	description: string
}[] = [
	{
		key: "playerListMessageId",
		type: "string",
		description: "The message ID of the player list message"
	},
	{
		key: "dayChat",
		type: "string",
		description: "The channel ID of the day chat"
	},
	{
		key: "wantedPrice",
		type: "integer",
		description: "The price to declare a wanted person"
	},
	{
		key: "investmentChance",
		type: "integer",
		description: "The chance of an investment being successful (0-100)"
	},
	{
		key: "canVote",
		type: "boolean",
		description: "Whether voting is enabled"
	},
	{
		key: "canInvest",
		type: "boolean",
		description: "Whether investing is enabled"
	},
	{
		key: "canRob",
		type: "boolean",
		description: "Whether robbing is enabled"
	},
	{
		key: "canFreeTravel",
		type: "boolean",
		description:
			"Whether traveling is unlimited (if disabled, travel uses up a night teleport)"
	}
]

export const prefix = "!"

export const botName = "Arenjizus"
export const admins = [
	"439223656200273932",
	"461298571786977309",
	"960888903764676618",
	"389840562112561183"
]

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
