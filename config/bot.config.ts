import { Intents, PermissionString, PresenceData } from "discord.js"

export default {
    prefixes: process.env.NODE_ENV === "production" ? ["!"] : ["!!"],
    botName: "Tusk",

    version: "0.1.0",
    admins: ["439223656200273932", "557691883518951435"],

    supportServer: "https://discord.gg/NfF3MyjyS8",

    presence: {
        status: "online",
        activities: [
            {
                type: "PLAYING",
                name: "with /help",
            },
        ],
    } as PresenceData,

    hastebin: "https://haste.jtjs.org",

    colors: {
        primary: "5865F2",
        success: "57F287",
        warning: "FEE75C",
        error: "ED4245",
    },

    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_WEBHOOKS],

    requiredPermissions: ["EMBED_LINKS", "SEND_MESSAGES", "USE_EXTERNAL_EMOJIS"] as PermissionString[],
}
