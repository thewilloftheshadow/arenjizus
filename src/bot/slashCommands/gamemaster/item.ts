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
