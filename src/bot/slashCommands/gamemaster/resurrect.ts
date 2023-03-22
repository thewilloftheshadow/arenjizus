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

        await this.client.logger.gameLog(`${name} has been resurrected!`)

        if (player.discordId) {
            await interaction.guild?.members
                .resolve(player.discordId)
                // ?.roles.add("1058507108959657996") // RWL ROLE dead
                // ?.roles.add("986633887121829908") // MAIN ROLE dead
                ?.roles.add("1087498947389571158") // TAZCJ role alive
                .catch(() => {})
        }
        if (player.discordId) {
            await interaction.guild?.members
                .resolve(player.discordId)
                // ?.roles.remove("1058507150336467034") // RWL ROLE alive
                // ?.roles.remove("954418834687811655") // MAIN ROLE alive
                ?.roles.remove("1087498947389571157") // TAZCJ role alive
                .catch(() => {})
        }

        await this.client.prisma.player.update({
            where: {
                id: player.id,
            },
            data: {
                deathStatus: "ALIVE",
            },
        })
        return interaction.editReply("<a:atada_big:543825795727228942>")
    }
}
