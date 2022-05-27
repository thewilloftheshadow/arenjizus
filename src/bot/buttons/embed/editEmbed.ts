import { ButtonInteraction } from "discord.js"
import Button from "../../../../lib/classes/Button"
import TuskClient from "../../../../lib/extensions/TuskClient"

export default class EditEmbed extends Button {
    constructor(client: TuskClient) {
        super("editEmbed", client)
    }

    override async run(interaction: ButtonInteraction) {
        const embedId = interaction.customId.split(",")[1]
        const embed = await this.client.prisma.embed.findFirst({ where: { id: embedId } })
        this.client.logger.debug(embedId)
        if (!embed) return interaction.editReply(this.client.functions.generateErrorMessage({ title: "Embed Not Found", description: "I was unable to find this embed in the database." }))

        this.client.embedBuilder.editEmbed(interaction, embed.id)
    }
}
