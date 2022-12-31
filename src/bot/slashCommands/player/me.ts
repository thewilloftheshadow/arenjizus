import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("me", client, {
            description: `See your own data`,
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        const player = await this.client.prisma.player.findFirst({
            where: {
                discordId: interaction.user.id,
            },
            include: {
                roles: true,
                items: true,
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
        return interaction.editReply({ embeds: [this.client.functions.playerEmbed(player)] })
    }
}
