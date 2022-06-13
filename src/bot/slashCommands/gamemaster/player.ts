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
                    name: "transfer",
                    description: "Transfer money between players",
                    options: [
                        {
                            type: "STRING",
                            name: "from",
                            description: "The name of the player to transfer from",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "STRING",
                            name: "to",
                            description: "The name of the player to transfer to",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "INTEGER",
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
        case "transfer": {
            const from = interaction.options.getString("from", true)
            const to = interaction.options.getString("to", true)
            const amount = interaction.options.getInteger("amount", true)
            const fromPlayer = await this.client.prisma.player.findFirst({
                where: {
                    name: from,
                },
            })
            const toPlayer = await this.client.prisma.player.findFirst({
                where: {
                    name: to,
                },
            })
            if (!fromPlayer) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `The player ${from} was not found in the database.`,
                    })
                )
            }
            if (!toPlayer) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `The player ${to} was not found in the database.`,
                    })
                )
            }
            if (fromPlayer.money < amount) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Insufficient funds",
                        description: `The player ${from} does not have enough money to transfer ${amount} to ${to}.`,
                    })
                )
            }
            const fromMoney = fromPlayer.money - amount
            const toMoney = toPlayer.money + amount
            await this.client.prisma.player.update({
                where: {
                    id: fromPlayer.id,
                },
                data: {
                    money: fromMoney,
                },
            })
            await this.client.prisma.player.update({
                where: {
                    id: toPlayer.id,
                },
                data: {
                    money: toMoney,
                },
            })
            this.client.logger.gameLog(`Player ${from} transferred ${amount} to ${to}.`)
            return interaction.editReply({ content: `${amount} has been successfully transferred.` })
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
            const linked = await this.client.prisma.player.findFirst({
                where: {
                    discordId: user.id,
                },
            })
            if (linked) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "User already linked",
                        description: `The user ${user.tag} is already linked to ${linked.name}.`,
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
