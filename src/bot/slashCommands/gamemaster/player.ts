/* eslint-disable no-case-declarations */
import { Prisma } from "@prisma/client"
import { CommandInteraction, MessageEmbed } from "discord.js"
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
                            autocomplete: true,
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
                        },
                        {
                            type: "INTEGER",
                            name: "money",
                            description: "The amount of money the player has",
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "update",
                    description: "update a player",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "INTEGER",
                            name: "money",
                            description: "The amount of money the player has",
                        },
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
                            autocomplete: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "list",
                    description: "List all players with their roles",
                },
                {
                    type: "SUB_COMMAND",
                    name: "balance",
                    description: "Update the balance of a player, using + or - before the number",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "STRING",
                            name: "amount",
                            description: "The amount to update the balance by",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "link",
                    description: "Link a player to their Discord account",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "USER",
                            name: "user",
                            description: "The Discord user to link to",
                            required: true,
                        }
                    ],
                },
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
                    items: true,
                },
            })
            if (!player) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `A player named ${name} was not found in the database.`,
                    })
                )
            }
            return interaction.editReply({ embeds: [this.client.functions.playerEmbed(player)] })
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
                    items: true,
                },
            })
            this.client.logger.gameLog(`Player ${player.name} was created.`)
            return interaction.editReply({ content: "Player successfully created:", embeds: [this.client.functions.playerEmbed(player)] })
        }
        case "update": {
            let player = await this.client.prisma.player.findFirst({
                where: {
                    name,
                },
                include: {
                    items: true,
                    roles: true,
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
            const data: Prisma.PlayerUpdateInput = {}
            const money = interaction.options.getInteger("money")
            if (money) data.money = money
            player = await this.client.prisma.player.update({
                where: {
                    id: player.id,
                },
                data,
                include: {
                    items: true,
                    roles: true,
                },
            })
            this.client.logger.gameLog(`Player ${player.name} was updated.`)
            return interaction.editReply({ content: "Player successfully updated:", embeds: [this.client.functions.playerEmbed(player)] })
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
        case "list": {
            const players = await this.client.prisma.player.findMany({
                include: {
                    roles: true,
                },
            })
            const embed = new MessageEmbed().setTitle("All Player Roles").setDescription("")
            players.forEach((player) => {
                embed.description += `${player.alive ? "😃" : "💀"} ${player.name} - ${player.roles.map((role) => role.roleName).join(", ")}\n`
            })
            return interaction.editReply({ embeds: [embed] })
        }
        case "balance": {
            const amount = interaction.options.getString("amount", true)
            if (!amount) return interaction.editReply("You must specify an amount to update the balance by.")
            let changeBy = 0
            const changeType = amount.slice(0, 1)
            switch (changeType) {
            case "+":
                changeBy = parseInt(amount, 10)
                break
            case "-":
                changeBy = 0 - parseInt(amount, 10)
                break
            default:
                return interaction.editReply("You must specify a + or - before the amount.")
            }
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

            const newPlayer = await this.client.prisma.player.update({
                where: {
                    id: player.id,
                },
                data: {
                    money: player.money + changeBy,
                },
                include: {
                    items: true,
                    roles: true,
                },
            })
            this.client.logger.gameLog(`Player ${player.name}'s balance was updated by ${amount}.`)
            return interaction.editReply({ content: "Player balance updated:", embeds: [this.client.functions.playerEmbed(newPlayer)] })
        }
        case "link": {
            const user = interaction.options.getUser("user", true)
            if (!user) return interaction.editReply("You must specify a user to link to.")
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
            await this.client.prisma.player.update({
                where: {
                    id: player.id,
                },
                data: {
                    discordId: user.id,
                },
                include: {
                    items: true,
                    roles: true,
                },
            })
            return interaction.editReply({ content: `Player has been linked to <@${user.id}>` })
        }
        default:
            break
        }
    }
}
