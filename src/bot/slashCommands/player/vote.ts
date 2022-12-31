import { CommandInteraction, TextBasedChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Vote extends SlashCommand {
    constructor(client: BetterClient) {
        super("vote", client, {
            description: `Vote for a player`,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The player you want to vote for",
                    required: true,
                    autocomplete: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const enabled = await this.client.prisma.keyV.findFirst({
            where: {
                key: "voteEnabled",
            },
        })
        if (!enabled?.valueBoolean) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({
                    title: "Voting is disabled",
                    description: "It is not currently time to vote.",
                })
            )
        }
        const player = await this.client.prisma.player.findFirst({
            where: {
                discordId: interaction.user.id,
            },
            include: {},
        })
        if (!player) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage(
                    {
                        title: "Player not linked",
                        description: "The gamemasters have not yet linked any player data to your Discord account. Please contact them to do so.",
                    },
                    false,
                    [],
                    true
                )
            )
        }
        const playerChosen = await this.client.prisma.player.findFirst({
            where: {
                name: interaction.options.getString("player", true),
            },
        })
        if (!playerChosen) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({
                    title: "Player not found",
                    description: "The player you specified could not be found.",
                })
            )
        }
        await this.client.prisma.player.update({
            where: {
                name: player.name,
            },
            data: {
                votedFor: {
                    connect: {
                        name: playerChosen.name,
                    },
                },
            },
        })

        const dayChat = await this.client.prisma.keyV.findFirst({
            where: {
                key: "dayChat",
            },
        })
        if (dayChat?.value) {
            const channel = this.client.channels.resolve(dayChat.value) as TextBasedChannel
            channel.send(`${player.name} has voted for ${playerChosen.name}!`).catch(() => {})
        }

        return interaction.editReply({ content: `Success!` })
    }
}
