import { Prisma } from "@prisma/client"
import { ModalSubmitInteraction } from "discord.js"
import ModalSubmit from "../../../../lib/classes/ModalSubmit"
import TuskClient from "../../../../lib/extensions/TuskClient"

export default class EditEmbed extends ModalSubmit {
    constructor(client: TuskClient) {
        super("embedBuilder", client)
    }

    override async run(interaction: ModalSubmitInteraction) {
        const embedId = interaction.customId.split(",")[1]
        const title = interaction.fields.getTextInputValue("title")
        const description = interaction.fields.getTextInputValue("description")
        const footer = interaction.fields.getTextInputValue("footer")
        const thumbnail = interaction.fields.getTextInputValue("thumbnail")
        const image = interaction.fields.getTextInputValue("image")

        const update: Prisma.EmbedUpdateInput = {
            title,
            description,
            footer,
            thumbnail,
            image,
        }

        const newEmbed = await this.client.prisma.embed.update({ where: { id: embedId }, data: update })

        const msg = this.client.functions.generateSuccessMessage({
            title: "Embed Updated",
            description: "Your embed has been updated, a preview of it is shown below:",
        })
        const sendEmbed = this.client.functions.buildEmbedFromDb(newEmbed)
        interaction.reply({ embeds: [msg.embeds[0], sendEmbed] })
    }
}
