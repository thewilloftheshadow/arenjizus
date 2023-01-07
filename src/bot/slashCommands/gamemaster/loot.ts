/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("loot", client, {
            description: `Loot a player's items and money`,
            options: [
                {
                    type: "STRING",
                    name: "from",
                    description: "The player to loot from",
                    required: true,
                },
                {
                    type: "STRING",
                    name: "to",
                    description: "The player to loot to",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        if (!interaction.guild) return
        const from = await this.client.prisma.player.findFirst({
            where: {
                name: interaction.options.getString("from", true),
            },
            include: {
                items: true,
            },
        })
        const to = await this.client.prisma.player.findFirst({
            where: {
                name: interaction.options.getString("to", true),
            },
        })
        if (!from) {
            return interaction.editReply("Invalid from")
        }
        if (!to) {
            return interaction.editReply("Invalid to")
        }
        from.items.forEach(async (item) => {
            await this.client.prisma.playerItems.create({
                data: {
                    item: {
                        connect: {
                            name: item.itemName,
                        },
                    },
                    player: {
                        connect: {
                            name: to.name,
                        },
                    },
                    amount: item.amount,
                },
            })
            await this.client.prisma.playerItems.delete({
                where: {
                    playerName_itemName: {
                        playerName: from.name,
                        itemName: item.itemName,
                    },
                },
            })
        })
        await this.client.prisma.player.update({
            where: {
                name: from.name,
            },
            data: {
                money: 0,
            },
        })
        await this.client.prisma.player.update({
            where: {
                name: to.name,
            },
            data: {
                money: {
                    increment: from.money,
                },
            },
        })
        await interaction.editReply(`Looted ${from.name} to ${to.name}`)
    }
}
