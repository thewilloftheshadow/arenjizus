import {
    ButtonInteraction, CommandInteraction, MessageActionRow, Modal, TextInputComponent
} from "discord.js"
import TuskClient from "../extensions/TuskClient"

export default class EmbedBuilder {
    client: TuskClient
    constructor(client: TuskClient) {
        this.client = client
    }

    public async editEmbed(interaction: CommandInteraction | ButtonInteraction, embedId: string) {
        const embed = await this.client.prisma.embed.findFirst({ where: { id: embedId } })
        if (!embed) {
            const msg = this.client.functions.generateErrorMessage({
                title: "Embed Not Found",
                description: `I was unable to find an embed with the ID of ${embedId}`,
            })
            if (interaction.deferred) {
                return interaction.editReply(msg)
            }
            if (interaction.replied) {
                return interaction.followUp(msg)
            }
            return interaction.reply(msg)
        }
        const modal = new Modal().setCustomId(`embedBuilder,${embedId}`).setTitle("Create your Embed")

        const row1 = new MessageActionRow<TextInputComponent>().addComponents(
            new TextInputComponent().setLabel("Title").setCustomId("title").setRequired(true)
                .setMinLength(1)
                .setMaxLength(256)
                .setStyle("SHORT")
        )
        const row2 = new MessageActionRow<TextInputComponent>().addComponents(
            new TextInputComponent()
                .setLabel("Description")
                .setCustomId("description")
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(1024)
                .setStyle("PARAGRAPH")
        )
        const row3 = new MessageActionRow<TextInputComponent>().addComponents(
            new TextInputComponent().setLabel("Footer").setCustomId("footer").setRequired(false)
                .setMinLength(0)
                .setMaxLength(256)
                .setStyle("SHORT")
        )
        const row4 = new MessageActionRow<TextInputComponent>().addComponents(
            new TextInputComponent()
                .setLabel("Thumbnail URL")
                .setCustomId("thumbnail")
                .setRequired(false)
                .setMinLength(0)
                .setMaxLength(1024)
                .setStyle("SHORT")
        )
        const row5 = new MessageActionRow<TextInputComponent>().addComponents(
            new TextInputComponent()
                .setLabel("Image URL")
                .setCustomId("image")
                .setRequired(false)
                .setMinLength(0)
                .setMaxLength(1024)
                .setStyle("SHORT")
                .setPlaceholder("Shown at the bottom of the embed")
        )

        if (embed) {
            if (embed.title) row1.components[0].setValue(embed.title)
            if (embed.description) row2.components[0].setValue(embed.description)
            if (embed.footer) row3.components[0].setValue(embed.footer)
            if (embed.thumbnail) row4.components[0].setValue(embed.thumbnail)
            if (embed.image) row5.components[0].setValue(embed.image)
        }
        modal.addComponents(row1, row2, row3, row4, row5)
        await interaction.showModal(modal)
    }
}
