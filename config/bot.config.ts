import { Intents, PermissionString, PresenceData } from "discord.js"

export default {
    prefixes: process.env.NODE_ENV === "production" ? ["!"] : ["!!"],
    botName: "Blobby",

    version: "1.0.0",
    admins: ["439223656200273932", "461298571786977309"],

    supportServer: "https://inv.wtf/shadow",

    presence: {
        status: "online",
        activities: [
            {
                type: "PLAYING",
                name: "with /help",
            },
        ],
    } as PresenceData,

    hastebin: "https://haste.narwhal.cool",

    colors: {
        primary: "5865F2",
        success: "57F287",
        warning: "FEE75C",
        error: "ED4245",
    },

    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],

    requiredPermissions: ["EMBED_LINKS", "SEND_MESSAGES", "USE_EXTERNAL_EMOJIS"] as PermissionString[],
}
