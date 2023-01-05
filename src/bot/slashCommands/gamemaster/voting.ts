/* eslint-disable no-case-declarations */
/* eslint-disable default-case */
import { CommandInteraction, MessageEmbed } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("voting", client, {
            description: `Manage voting in the game`,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "show",
                    description: "Show the current votes",
                },
                {
                    type: "SUB_COMMAND",
                    name: "close",
                    description: "Close voting",
                },
                {
                    type: "SUB_COMMAND",
                    name: "open",
                    description: "Open voting",
                },
                {
                    type: "SUB_COMMAND",
                    name: "reset",
                    description: "Reset voting",
                },
                {
                    type: "SUB_COMMAND",
                    name: "setworth",
                    description: "Set the worth of a player's vote",
                    options: [
                        {
                            type: "STRING",
                            name: "player",
                            description: "The player to set the worth of",
                            required: true,
                        },
                        {
                            type: "INTEGER",
                            name: "worth",
                            description: "The worth of the vote",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "setvote",
                    description: "Set a player's vote",
                    options: [
                        {
                            type: "STRING",
                            name: "player",
                            description: "The player to set the vote of",
                            required: true,
                        },
                        {
                            type: "STRING",
                            name: "vote",
                            description: "The player to vote for",
                            required: true,
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "set_daychat",
                    description: "Set the daychat channel",
                    options: [
                        {
                            type: "CHANNEL",
                            name: "channel",
                            description: "The channel to set as the daychat channel",
                            required: true,
                        },
                    ],
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const players = await this.client.prisma.player.findMany()

        switch (interaction.options.getSubcommand()) {
        case "show":
            const votes = players.map((player) =>
                (player.votedForName
                    ? `${player.name} - ${player.voteWorth} vote${player.voteWorth === 1 ? "" : "s"} for ${player.votedForName}`
                    : `${player.name} - No vote`))
            const embed = new MessageEmbed().setTitle("Current Votes").setColor("RANDOM").setTimestamp()
                .setDescription(votes.join("\n"))
            return interaction.editReply({ embeds: [embed] })

        case "close":
            await this.client.prisma.keyV.upsert({
                where: {
                    key: "voteEnabled",
                },
                update: {
                    valueBoolean: false,
                },
                create: {
                    key: "voteEnabled",
                    valueBoolean: false,
                },
            })
            return interaction.editReply("Voting has been closed")

        case "open":
            await this.client.prisma.keyV.upsert({
                where: {
                    key: "voteEnabled",
                },
                update: {
                    valueBoolean: true,
                },
                create: {
                    key: "voteEnabled",
                    valueBoolean: true,
                },
            })
            return interaction.editReply("Voting has been opened")

        case "reset":
            await this.client.prisma.player.updateMany({
                data: {
                    votedForName: null,
                },
            })
            return interaction.editReply("Votes have been reset")

        case "setworth":
            const player = interaction.options.getString("player", true)
            const worth = interaction.options.getInteger("worth", true)
            const playerData = await this.client.prisma.player.findUnique({
                where: {
                    name: player,
                },
            })
            if (!playerData) return interaction.editReply("Player not found")
            await this.client.prisma.player.update({
                where: {
                    name: player,
                },
                data: {
                    voteWorth: worth,
                },
            })
            return interaction.editReply(`Set ${player}'s vote worth to ${worth}`)

        case "setvote":
            const player2 = interaction.options.getString("player", true)
            const vote = interaction.options.getString("vote", true)
            const playerData2 = await this.client.prisma.player.findUnique({
                where: {
                    name: player2,
                },
            })
            if (!playerData2) return interaction.editReply("Player not found")
            await this.client.prisma.player.update({
                where: {
                    name: player2,
                },
                data: {
                    votedForName: vote,
                },
            })
            return interaction.editReply(`Set ${player2}'s vote to ${vote}`)

        case "set_daychat":
            const channel = interaction.options.getChannel("channel", true)
            if (channel.type !== "GUILD_TEXT") return interaction.editReply("Channel must be a text channel")
            await this.client.prisma.keyV.upsert({
                where: {
                    key: "dayChat",
                },
                update: {
                    value: channel.id,
                },
                create: {
                    key: "dayChat",
                    value: channel.id,
                },
            })
            return interaction.editReply(`Set daychat to ${channel}`)
        }
    }
}
