/* eslint-disable max-len */
import { GiveawayType } from "@prisma/client"
import {
    CommandInteraction, MessageActionRow, MessageButton
} from "discord.js"
import { parse } from "@lukeed/ms"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/TuskClient"

export default class Config extends SlashCommand {
    constructor(client: BetterClient) {
        super("giveaway", client, {
            description: `Send a giveaway`,
            guildOnly: true,
            options: [
                {
                    type: "STRING",
                    name: "prize",
                    description: "The prize for this giveaway",
                    required: true,
                },
                {
                    type: "STRING",
                    name: "time",
                    description: "Time for this giveaway (format in 1h30m, for example)",
                    required: true,
                },
                {
                    type: "STRING",
                    name: "type",
                    description: "Type of this giveaway",
                    required: true,
                    choices: Object.keys(GiveawayType).map((k) => ({ name: client.functions.titleCase(k), value: k })),
                },
                {
                    type: "BOOLEAN",
                    name: "ping",
                    description: "Should this giveaway be pinged? Defaults to true",
                    required: false,
                },
                {
                    type: "STRING",
                    name: "description",
                    description: "Giveaway description (Shown in the embed)",
                    required: false,
                },
                {
                    type: "STRING",
                    name: "footer",
                    description: "Giveaway footer (Shown at the bottom of the embed)",
                    required: false,
                },
                {
                    type: "STRING",
                    name: "image",
                    description: "Image URL attached to the embed",
                    required: false,
                },
                {
                    type: "NUMBER",
                    name: "winners",
                    description: "Number of winners for this giveaway",
                    required: false,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const prize = interaction.options.getString("prize") || "Mystery Giveaway"
        const rawtime = interaction.options.getString("time") || "24h"
        const type = interaction.options.getString("type") as GiveawayType
        const ping = interaction.options.getBoolean("ping") || true
        const description = interaction.options.getString("description") || "Click the button below to enter!"
        const message = interaction.options.getString("message")
        const footer = interaction.options.getString("footer") || `${this.client.user?.username}`
        const image = interaction.options.getString("image")
        const winners = interaction.options.getNumber("winners") || 1

        const time = parse(rawtime)
        if (!time) return interaction.editReply("Please only use one format for the time (1h, 1d, etc)")

        const giveawayEmbed = {
            title: prize,
            description,
            footer,
            image,
        }

        const data = {
            prize,
            time,
            type,
            doPing: ping,
            message,
            winnerCount: winners,
            staff: interaction.user.id,
            embed: {
                create: giveawayEmbed,
            },
        }

        const result = await this.client.prisma.giveaway.create({
            data,
            include: {
                embed: true,
            },
        })

        const buttons = new MessageActionRow()
        buttons.addComponents(
            new MessageButton().setLabel("Send Giveaway").setCustomId(`sendGwa:${interaction.user.id},${result.id}`).setStyle("SUCCESS"),
            new MessageButton()
                .setLabel("Edit Embed")
                .setCustomId(`editEmbed:${interaction.user.id},${result.embed.id}`)
                .setStyle("SECONDARY"),
            new MessageButton()
                .setLabel("Cancel Giveaway")
                .setCustomId(`cancelGwa:${interaction.user.id},${result.id}`)
                .setStyle("DANGER"),
        )

        const sendEmbed = this.client.functions.buildEmbedFromDb(result.embed)
        await interaction.editReply({
            content: `Your giveaway has been setup, using the ID \`${result.id}\`. The giveaway timer will not trigger until you actually send the giveaway. When you are ready to send it, use the green Send button below. Note: this button will only work for you, and if you delete the message, a developer will have to manually trigger the sending of the giveaway.\n**Giveaway Preview:**\n\n`,
            embeds: [sendEmbed],
            components: [buttons],
        })
    }
}
