import { CommandInteraction, TextChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Want extends SlashCommand {
    constructor(client: BetterClient) {
        super("wanted", client, {
            description: `Mark a player as wanted`,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The player you want to mark as wanted",
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
                    title: "Disabled",
                    description: "It is not currently time to mark players as wanted.",
                })
            )
        }
        const player = await this.client.prisma.player.findFirst({
            where: {
                discordId: interaction.user.id,
            },
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

        const currentPriceData = await this.client.prisma.keyV.findFirst({
            where: {
                key: "wantedPrice",
            },
        })
        const wantedPrice = currentPriceData?.valueInt || 0

        const playerChosen = await this.client.prisma.player.findFirst({
            where: {
                name: interaction.options.getString("name", true),
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

        if (player.money < wantedPrice) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({
                    title: "Not enough money",
                    description: `You do not have enough money to mark ${playerChosen.name} as wanted. You need $${wantedPrice}, but you only have $${player.money}.`,
                })
            )
        }

        await this.client.prisma.player.update({
            where: {
                name: player.name,
            },
            data: {
                money: player.money - wantedPrice,
            },
        })

        const newPrice = wantedPrice + 5

        const dayChat = await this.client.prisma.keyV.findFirst({
            where: {
                key: "dayChat",
            },
        })
        if (dayChat?.value) {
            const channel = this.client.channels.resolve(dayChat.value) as TextChannel
            await channel
                .send(
                    ` <a:siren:1084362013247033405> Someone has declared ${playerChosen.name} as wanted! <a:siren:1084362013247033405>\nIt now costs $${newPrice} to declare someone wanted!`
                )
                .catch(() => {})
            channel.setTopic(`Wanted: ${playerChosen.name} | Price to change: $${newPrice}`).catch(() => {})
        }

        await this.client.prisma.keyV.upsert({
            where: {
                key: "wantedPrice",
            },
            update: {
                valueInt: newPrice,
            },
            create: {
                key: "wantedPrice",
                valueInt: newPrice,
            },
        })

        this.client.logger.gameLog(`${player.name} has declared ${playerChosen.name} as wanted for ${wantedPrice}!`)

        return interaction.editReply({ content: `Success!` })
    }
}
