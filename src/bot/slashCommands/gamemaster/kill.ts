import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("kill", client, {
            description: `Kill a player`,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The name of the player",
                    required: true,
                    autocomplete: true,
                },
                {
                    type: "BOOLEAN",
                    name: "fake",
                    description: "Whether this death is faked (e.g. ketchup) or real",
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const name = interaction.options.getString("name", true)
        const fake = interaction.options.getString("fake", false)
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
                deathStatus: fake ? "FAKED" : "DEAD",
            },
        })

        return interaction.editReply({
            content: "<:aukilling:762406290898288640><:aukilled:762406290952814632>",
        })
    }
}
