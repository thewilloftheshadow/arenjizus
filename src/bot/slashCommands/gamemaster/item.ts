import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("item", client, {
            description: `Manage an item in the game`,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "give",
                    description: "Give an item to a player",
                    options: [
                        {
                            type: "STRING",
                            name: "item",
                            description: "The name of the item",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: "STRING",
                            name: "player",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: "INTEGER",
                            name: "amount",
                            description: "The amount of items to give",
                            required: true,
                        },
                        {
                            type: "BOOLEAN",
                            name: "payment",
                            description: "Deduct the price from the players balance?",
                            required: true
                        }
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "revoke",
                    description: "Revoke all items of a type from a player",
                    options: [
                        {
                            type: "STRING",
                            name: "item",
                            description: "The name of the item",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: "STRING",
                            name: "player",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "view",
                    description: "View an item",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the item",
                            required: true,
                            autocomplete: true
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "create",
                    description: "Create an item",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the item",
                            required: true
                        },
                        {
                            type: "STRING",
                            name: "description",
                            description: "The description of the item",
                            required: true,
                        },
                        {
                            type: "NUMBER",
                            name: "price",
                            description: "The price of the item",
                            required: true,
                        },
                    ],
                },

                {
                    type: "SUB_COMMAND",
                    name: "update",
                    description: "Update an item",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the item",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: "STRING",
                            name: "description",
                            description: "The description of the item",
                            required: true,
                        },
                        {
                            type: "NUMBER",
                            name: "price",
                            description: "The price of the item",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "delete",
                    description: "Delete an item",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the item",
                            required: true,
                            autocomplete: true
                        },
                    ],
                }
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const type = interaction.options.getSubcommand(false)
        const name = interaction.options.getString("name") || ""

        switch (type) {
        case "give": {
            const itemName = interaction.options.getString("item", true)
            const playerName = interaction.options.getString("player", true)
            const amount = interaction.options.getInteger("amount", true)
            const payment = interaction.options.getBoolean("payment", true)
            const item = await this.client.prisma.item.findFirst({
                where: {
                    name: itemName
                }
            })
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name: playerName
                }
            })
            if (!item) return interaction.reply("Item not found")
            if (!player) return interaction.reply("Player not found")
            const cost = amount * item.price
            if (payment) {
                if (player.money < cost) { return interaction.editReply(`The player does not have enough money to buy ${amount} ${itemName}`) }
                await this.client.prisma.player.update({
                    where: {
                        id: player.id
                    },
                    data: {
                        money: player.money - cost
                    }
                })
            }
            await this.client.prisma.playerItems.create({
                data: {
                    player: {
                        connect: {
                            id: player.id
                        }
                    },
                    item: {
                        connect: {
                            id: item.id
                        }
                    },
                    amount: amount ?? 1
                }
            })

            this.client.logger.gameLog(`${playerName} has been given ${amount} ${itemName}`)
            return interaction.editReply(`${playerName} has been given ${amount} ${itemName}`)
        }
        case "revoke": {
            const itemName = interaction.options.getString("item", true)
            const playerName = interaction.options.getString("player", true)
            const item = await this.client.prisma.item.findFirst({
                where: {
                    name: itemName
                }
            })
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name: playerName
                }
            })
            if (!item) return interaction.reply("Item not found")
            if (!player) return interaction.reply("Player not found")
            await this.client.prisma.playerItems.delete({
                where: {
                    playerName_itemName: {
                        playerName,
                        itemName
                    }
                }
            })

            this.client.logger.gameLog(`${playerName} has had all of their ${itemName} revoked`)
            return interaction.editReply(`${playerName} has had all of their ${itemName} revoked`)
        }

        case "view": {
            const item = await this.client.prisma.item.findFirst({
                where: {
                    name,
                },
                include: {
                    players: true
                }
            })
            if (!item) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Item not found",
                        description: `The item ${name} was not found in the database.`,
                    })
                )
            }
            return interaction.editReply({ embeds: [this.client.functions.itemEmbed(item)] })
        }
        case "create": {
            const item = await this.client.prisma.item.create({
                data: {
                    name,
                    description: interaction.options.getString("description") || "",
                    price: interaction.options.getNumber("price", true),
                },
                include: {
                    players: true
                }
            })
            this.client.logger.gameLog(`Item ${item.name} was created.`)
            return interaction.editReply({ content: "Item successfully created:", embeds: [this.client.functions.itemEmbed(item)] })
        }
        case "update": {
            let item = await this.client.prisma.item.findFirst({
                where: {
                    name,
                },
                include: {
                    players: true
                }
            })
            if (!item) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Item not found",
                        description: `The item ${name} was not found in the database.`,
                    })
                )
            }
            item = await this.client.prisma.item.update({
                where: {
                    id: item.id,
                },
                data: {
                    description: interaction.options.getString("description") || "",
                    price: interaction.options.getNumber("price", true),
                },
                include: {
                    players: true
                }
            })
            this.client.logger.gameLog(`Item ${item.name} was updated.`)
            return interaction.editReply({ content: "Item successfully updated:", embeds: [this.client.functions.itemEmbed(item)] })
        }
        case "delete": {
            const item = await this.client.prisma.item.findFirst({
                where: {
                    name,
                },
            })
            if (!item) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Item not found",
                        description: `The item ${name} was not found in the database.`,
                    })
                )
            }
            await this.client.prisma.item.delete({
                where: {
                    id: item.id,
                },
            })
            await this.client.prisma.playerItems.deleteMany({
                where: {
                    item: {
                        id: item.id,
                    },
                },
            })
            this.client.logger.gameLog(`Item ${item.name} was deleted.`)
            return interaction.editReply({ content: "Item successfully deleted." })
        }
        default:
            break
        }
    }
}
