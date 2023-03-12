import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("role", client, {
            description: `Manage an role in the game`,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "assign",
                    description: "Assign a role to a player",
                    options: [
                        {
                            type: "STRING",
                            name: "player",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "STRING",
                            name: "role",
                            description: "The name of the role",
                            required: true,
                            autocomplete: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "unassign",
                    description: "Unassign a role to a player",
                    options: [
                        {
                            type: "STRING",
                            name: "player",
                            description: "The name of the player",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "STRING",
                            name: "role",
                            description: "The name of the role",
                            required: true,
                            autocomplete: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "view",
                    description: "View an role",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the role",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "BOOLEAN",
                            name: "hide_users",
                            description: "Whether to hide the users with this role",
                            required: false
                        }
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "create",
                    description: "Create an role",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the role",
                            required: true,
                        },
                        {
                            type: "STRING",
                            name: "description",
                            description: "The description of the role",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "update",
                    description: "Update an role",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the role",
                            required: true,
                            autocomplete: true,
                        },
                        {
                            type: "STRING",
                            name: "description",
                            description: "The description of the role",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "delete",
                    description: "Delete an role",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the role",
                            required: true,
                            autocomplete: true,
                        },
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
            const role = await this.client.prisma.role.findFirst({
                where: {
                    name,
                },
                include: {
                    players: true,
                },
            })
            if (!role) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Role not found",
                        description: `The role ${name} was not found in the database.`,
                    })
                )
            }
            const hideUsers = interaction.options.getBoolean("hide_users", true)
            return interaction.editReply({ embeds: [this.client.functions.roleEmbed(role, hideUsers)] })
        }
        case "update": {
            let role = await this.client.prisma.role.findFirst({
                where: {
                    name,
                },
                include: {
                    players: true,
                },
            })
            if (!role) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Role not found",
                        description: `The role ${name} was not found in the database.`,
                    })
                )
            }
            role = await this.client.prisma.role.update({
                where: {
                    id: role.id,
                },
                data: {
                    description: interaction.options.getString("description") || "",
                },
                include: {
                    players: true,
                },
            })
            this.client.logger.gameLog(`Role ${role.name} was updated.`)
            return interaction.editReply({ content: "Role successfully updated:", embeds: [this.client.functions.roleEmbed(role)] })
        }
        case "create": {
            const role = await this.client.prisma.role.create({
                data: {
                    name,
                    description: interaction.options.getString("description") || "",
                },
                include: {
                    players: true,
                },
            })
            this.client.logger.gameLog(`Role ${role.name} was created.`)
            return interaction.editReply({ content: "Role successfully created:", embeds: [this.client.functions.roleEmbed(role)] })
        }
        case "delete": {
            const role = await this.client.prisma.role.findFirst({
                where: {
                    name,
                },
            })
            if (!role) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Role not found",
                        description: `The role ${name} was not found in the database.`,
                    })
                )
            }
            await this.client.prisma.role.delete({
                where: {
                    id: role.id,
                },
            })
            await this.client.prisma.playerRoles.deleteMany({
                where: {
                    role: {
                        id: role.id,
                    },
                },
            })
            this.client.logger.gameLog(`Role ${role.name} was deleted.`)
            return interaction.editReply({ content: "Role successfully deleted." })
        }
        case "assign": {
            const playerName = interaction.options.getString("player", true)
            const roleName = interaction.options.getString("role", true)

            const role = await this.client.prisma.role.findFirst({
                where: {
                    name: roleName,
                },
            })
            if (!role) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Role not found",
                        description: `The role ${roleName} was not found in the database.`,
                    })
                )
            }
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name: playerName,
                },
            })
            if (!player) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `The player ${playerName} was not found in the database.`,
                    })
                )
            }
            await this.client.prisma.playerRoles.create({
                data: {
                    player: {
                        connect: {
                            id: player.id,
                        },
                    },
                    role: {
                        connect: {
                            id: role.id,
                        },
                    },
                },
            })
            this.client.logger.gameLog(`Player ${player.name} was assigned to role ${role.name}.`)
            return interaction.editReply({ content: "Player successfully assigned to role." })
        }
        case "unassign": {
            const playerName = interaction.options.getString("player", true)
            const roleName = interaction.options.getString("role", true)

            const role = await this.client.prisma.role.findFirst({
                where: {
                    name: roleName,
                },
            })
            if (!role) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Role not found",
                        description: `The role ${roleName} was not found in the database.`,
                    })
                )
            }
            const player = await this.client.prisma.player.findFirst({
                where: {
                    name: playerName,
                },
            })
            if (!player) {
                return interaction.editReply(
                    this.client.functions.generateErrorMessage({
                        title: "Player not found",
                        description: `The player ${playerName} was not found in the database.`,
                    })
                )
            }
            await this.client.prisma.playerRoles.delete({
                where: {
                    playerName_roleName: {
                        playerName: player.name,
                        roleName: role.name,
                    },
                },
            })
            this.client.logger.gameLog(`Player ${player.name} was unassigned from role ${role.name}.`)
            return interaction.editReply({ content: "Player successfully unassigned from role." })
        }
        default:
            break
        }
    }
}
