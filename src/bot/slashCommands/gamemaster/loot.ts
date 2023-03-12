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

        const itemList: { name: string; amount: number }[] = []
        for await (const item of from.items) {
            const list = itemList.find((i) => i.name === item.itemName)
            if (list) {
                list.amount += item.amount
            } else {
                itemList.push({
                    name: item.itemName,
                    amount: item.amount,
                })
            }
            const hasItem = await this.client.prisma.playerItems.findFirst({
                where: {
                    playerName: to.name,
                    itemName: item.itemName,
                },
            })
            if (hasItem) {
                await this.client.prisma.playerItems.update({
                    where: {
                        playerName_itemName: {
                            playerName: to.name,
                            itemName: item.itemName,
                        },
                    },
                    data: {
                        amount: {
                            increment: item.amount,
                        },
                    },
                })
            } else {
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
            }
            await this.client.prisma.playerItems.delete({
                where: {
                    playerName_itemName: {
                        playerName: from.name,
                        itemName: item.itemName,
                    },
                },
            })
        }
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
        await this.client.logger.gameLog(
            `${from.name} looted ${to.name} and got ${from.money} money and ${from.items.length} items: ${itemList
                .map((i) => `${i.name} x${i.amount}`)
                .join(", ")}`
        )
    }
}
