import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("resurrect", client, {
            description: `Resurrect a player`,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The name of the player",
                    required: true,
                    autocomplete: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const name = interaction.options.getString("name", true)
        const player = await this.client.prisma.player.findFirst({
            where: {
                name,
            },
        })
        if (!player) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({ title: "Player not found", description: `Could not find player ${name}` })
            )
        }

        await this.client.prisma.player.update({
            where: {
                id: player.id,
            },
            data: {
                alive: true,
            },
        })
    }
}
