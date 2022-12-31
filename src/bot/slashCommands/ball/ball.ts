/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("ball", client, {
            description: `Send a message to the ball`,
            options: [
                {
                    type: "STRING",
                    name: "message",
                    description: "The message to send to the ball",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const message = interaction.options.getString("message", true)
        const ballData = await this.client.prisma.playerBallData.findFirst({
            where: {
                player: {
                    discordId: interaction.user.id,
                },
            },
        })
        if (!ballData) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage(
                    {
                        title: "Persona not setup",
                        description:
                            "You have not yet set your persona for the ball! Use `/ballset` to do that, but beware, you can only set it once!",
                    },
                    false,
                    [],
                    true
                )
            )
        }
        const sent = await this.client.logger.webhookLog("ball", {
            content: message,
            username: ballData.name,
            avatarURL: ballData.avatar,
        })
        return interaction.editReply({
            content: "Your message has been sent to the ball!",
            components: [
                new MessageActionRow().addComponents(
                    new MessageButton()
                        .setStyle("LINK")
                        .setLabel("View Message")
                        .setURL(`https://discord.com/channels/${interaction.guild!.id}/${sent.channel_id}/${sent.id}`)
                ),
            ],
        })
    }
}
