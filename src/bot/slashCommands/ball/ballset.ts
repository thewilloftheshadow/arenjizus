/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandInteraction, TextChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("ballset", client, {
            description: `Set your persona for the masquerade (Cannot be changed again after)`,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The name of your persona",
                    required: true,
                },
                {
                    type: "ATTACHMENT",
                    name: "avatar",
                    description: "The avatar of your persona",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const player = await this.client.prisma.player.findFirst({
            where: {
                discordId: interaction.user.id,
            },
            include: {
                ballData: true,
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
        if (player.ballData) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({
                    title: "Persona already set",

                    description: "You have already set your persona for the ball! Use `/ball` to send a message to the ball!",
                })
            )
        }
        const name = interaction.options.getString("name", true)
        const avatarRaw = interaction.options.getAttachment("avatar", true)
        const doNotDelete = interaction.guild?.channels.cache.get("986317466613469204") as TextChannel
        const avatarStored = await doNotDelete.send({
            content: `Ball avatar for <@${interaction.user.id}>`,
            files: [avatarRaw],
        })
        const avatar = avatarStored.attachments.first()?.url || "https://cdn.discordapp.com/icons/954417356044652584/2a9782087e97860e8b788aa5505e00fd.png"
        const ballData = await this.client.prisma.playerBallData.create({
            data: {
                player: {
                    connect: {
                        id: player.id,
                    },
                },
                name,
                avatar,
            },
        })
        return interaction.editReply({
            content: `Your persona has been set for the ball!\n\nName: ${ballData.name}\nAvatar: ${ballData.avatar}`,
        })
    }
}
