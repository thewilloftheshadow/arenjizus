/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
import { CommandInteraction, MessageEmbed } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/TuskClient"

export default class Item extends SlashCommand {
    constructor(client: BetterClient) {
        super("item", client, {
            description: `Get information on an item`,
            guildOnly: true,
            options: [
                {
                    type: "STRING",
                    name: "name",
                    description: "The name of the item",
                    required: true,
                    autocomplete: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const name = interaction.options.getString("name")

        if (!name) return interaction.editReply("You must provide a name")

        // The actual value provided by the autocomplete is the ID of the item
        const item = await this.client.prisma.item.findFirst({
            where: {
                name,
            },
        })

        if (!item) {
            return interaction.editReply(
                this.client.functions.generateErrorMessage({ title: "Item not found", description: `I could not find an item with the name ${name}` })
            )
        }

        const embed = new MessageEmbed({
            title: item.name,
            description: `${item.description || "No description provided"}\n`,
            color: "RANDOM",
        })
        if (item.emoji) embed.setThumbnail(this.client.functions.getEmojiUrl(item.emoji))
        if (item.feedable) embed.description += `\nThis item can be fed to the bot for ${item.feedValue} entries`
        if (item.redeemable) {
            embed.description += `\nThis item can be redeemed for the following:\n${this.client.functions
                .parseRedeemItems(item.redeemItems, true)
                .join("\n")}`
        }
        if (item.playChance) embed.description += `\nThis item has a ${item.playChance}% chance of being found in the /play command`

        interaction.editReply({ embeds: [embed] })
    }
}
