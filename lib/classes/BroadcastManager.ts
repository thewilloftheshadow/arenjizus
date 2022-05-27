/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { GiveawaySetting, GiveawayType } from "@prisma/client"
import {
    Collection, MessageActionRow, MessageEmbed, MessageOptions
} from "discord.js"
import TuskClient from "../extensions/TuskClient"

// eslint-disable-next-line no-shadow
export enum BroadcastType {
    ANNOUCEMENT = 0,
    GIVEAWAY = 1,
    GIVEAWAY_END = 2,
}

export type EmbedData = {
    title: string
    description: string
    color: number
    thumbnail: string
    image: string
    footer: string
}

export type BroadcastData = {
    embed?: EmbedData
    message?: string | null
    components: MessageActionRow[]
    giveawayType?: GiveawayType
}

export default class BroadcastManager {
    private client: TuskClient
    constructor(client: TuskClient) {
        this.client = client
    }

    async shardBroadcast(type: BroadcastType, data: BroadcastData, guildFilter?: string | string[]) {
        this.client.emit("broadcast", type, data, guildFilter)
    }

    async broadcast(type: BroadcastType, data: BroadcastData, guildFilter?: string | string[]) {
        let filter: string[] = []
        if (typeof guildFilter === "string") filter = [guildFilter]
        else if (guildFilter) filter = guildFilter

        const toSend: MessageOptions = { content: "** **", components: data.components }
        if (data.embed) {
            const embed = new MessageEmbed()
            if (data.embed.title) embed.setTitle(data.embed.title)
            if (data.embed.description) embed.setDescription(data.embed.description)
            if (data.embed.color) embed.setColor(data.embed.color)
            if (data.embed.footer) embed.setFooter({ text: data.embed.footer })
            if (data.embed.image) embed.setImage(data.embed.image)
            if (data.embed.thumbnail) embed.setThumbnail(data.embed.thumbnail)
            toSend.embeds = [embed]
        }
        toSend.content = `%%ping%%${data.message ? `\n${data.message}` : ""}`

        const allSettings = await this.getBroadcastChannels(type, data.giveawayType)

        allSettings.forEach(async (setting, guildId) => {
            if (filter.length > 0 && filter.includes(guildId)) return
            const channel = this.client.channels.cache.get(setting.channel)
            if (!channel || !channel.isText()) return
            const sendingNow = { ...toSend, allowedMentions: { roles: [setting.ping] } }
            sendingNow.content = sendingNow.content?.replace(/%%ping%%/g, `<@&${setting.ping}>`) || `<@&${setting.ping}>`
            channel.send(sendingNow)
        })
    }

    private async getBroadcastChannels(type: BroadcastType, giveawayType?: GiveawayType) {
        const channels = new Collection<string, GiveawaySetting>()

        if (type === BroadcastType.GIVEAWAY) {
            await Promise.all(this.client.guilds.cache.map(async (guild) => {
                const gData = await this.client.prisma.guild.findFirst({
                    where: {
                        id: guild.id,
                    },
                    include: {
                        giveawaySettings: true,
                    },
                })
                const settings: GiveawaySetting[] | undefined = gData?.giveawaySettings
                if (!settings) return
                const applicable = settings.find((set) => set.type === giveawayType)
                if (!applicable || !applicable?.enabled) return
                channels.set(guild.id, applicable)
            }))
        }
        return channels
    }
}
