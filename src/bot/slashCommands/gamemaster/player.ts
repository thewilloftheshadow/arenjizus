import { Prisma } from "@prisma/client"
import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("player", client, {
            description: `Manage a player in the game`,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "view",
                    description: "View a player",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "create",
                    description: "Create a player",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true
                        },
                        {
                            type: "INTEGER",
                            name: "money",
                            description: "The amount of money the player has",
                        }
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "delete",
                    description: "Delete a player",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
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
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name,
                },
                include: {
                    roles: true,
                    items: true
                }
            })
            if (!player) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `A player named ${name} was not found in the database.`,
                    })
                )
            }
            return interaction.editReply(`${JSON.stringify(player, null, 2)}`)
        }
        case "create": {
            const create: Prisma.PlayerCreateInput = {
                name,
            }
            const money = interaction.options.getInteger("money")
            if (money) create.money = money
            const player = await this.client.prisma.player.create({
                data: {
                    name,
                },
                include: {
                    roles: true,
                    items: true
                }
            })
            this.client.logger.gameLog(`Player ${player.name} was created.`)
            return interaction.editReply({ content: "Player successfully created:", embeds: [this.client.functions.playerEmbed(player)] })
        }
        case "delete": {
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name,
                },
            })
            if (!player) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `The player ${name} was not found in the database.`,
                    })
                )
            }
            await this.client.prisma.player.delete({
                where: {
                    id: player.id,
                },
            })
            await this.client.prisma.playerRoles.deleteMany({
                where: {
                    player: {
                        id: player.id,
                    },
                },
            })
            await this.client.prisma.playerItems.deleteMany({
                where: {
                    player: {
                        id: player.id,
                    },
                },
            })
            this.client.logger.gameLog(`Player ${player.name} was deleted.`)
            return interaction.editReply({ content: "Player successfully deleted." })
        }
        default:
            break
        }
    }
}
