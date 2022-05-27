import { EntryData, GiveawayType } from "@prisma/client"
import { MessageActionRow, MessageButton } from "discord.js"
import TuskClient from "../extensions/TuskClient"
import { BroadcastType } from "./BroadcastManager"

export type GiveawayEntries = { guild: number; bonus: number; total: number }
export default class GiveawayManager {
    private client: TuskClient
    constructor(client: TuskClient) {
        this.client = client
    }

    async fetch(id: string) {
        const gwa = await this.client.prisma.giveaway.findFirst({
            where: {
                id,
            },
            include: {
                entries: true,
                embed: true,
            },
        })
        return gwa
    }

    async cancelGiveaway(id: string) {
        await this.client.prisma.giveaway.update({ where: { id }, data: { canceled: true } })
        return true
    }

    async sendGiveaway(id: string, guild?: string) {
        const giveaway = await this.fetch(id)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const bcData: { embed?: any; message?: string; giveawayType: GiveawayType; components: MessageActionRow[] } = {
            giveawayType: giveaway?.type || "OTHER",
            components: [this.giveawayButton(id)],
        }
        if (giveaway?.embed) bcData.embed = giveaway.embed
        if (giveaway?.message) bcData.message = giveaway.message

        if (guild) this.client.broadcastManager.shardBroadcast(BroadcastType.GIVEAWAY, bcData, guild)
        else this.client.broadcastManager.shardBroadcast(BroadcastType.GIVEAWAY, bcData)
    }

    async totalEntries(id: string) {
        const entries = await this.client.prisma.entryData.findMany({
            where: {
                giveawayId: id,
            },
        })
        const result: GiveawayEntries = { guild: 0, bonus: 0, total: 0 }
        entries.forEach((entry) => {
            result.guild += entry.guild.length
            result.bonus += entry.bonus
        })
        result.total = result.guild + result.bonus
        return result
    }

    async getEntries(id: string, userId: string) {
        const entries: EntryData | null = await this.client.prisma.entryData.findFirst({
            where: {
                giveawayId: id,
                userId,
            },
        })
        const result: GiveawayEntries = {
            guild: entries?.guild.length || 0,
            bonus: entries?.bonus || 0,
            total: (entries?.guild.length || 0) + (entries?.bonus || 0),
        }
        return result
    }

    giveawayButton(id: string) {
        return new MessageActionRow().addComponents(new MessageButton().setLabel("🎉 Enter").setCustomId(`enterGwa:${id}`).setStyle("SECONDARY"))
    }
}
