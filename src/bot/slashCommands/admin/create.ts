/* eslint-disable no-case-declarations */
/* eslint-disable max-len */
import { Item, Prisma } from "@prisma/client"
import { CommandInteraction } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/TuskClient"

const itemHaste = (item: Item) => {
    const divider = "\n\n========================================\n\n"
    let output = ""

    output += `Item Creation Data\n`
    output += `Generated ${new Date().toISOString()}\n`
    output += divider

    output += `Name: ${item.name}\n`
    output += `Description: ${item.description}\n`
    output += `Emoji: ${item.emoji}\n`
    output += `Feed Value: ${item.feedValue}\n`
    output += `Redeem Items: ${item.redeemItems?.join(",") || null}\n`
    output += `Play Chance: ${item.playChance}\n`
    output += divider
    output += `Raw Data:\n`
    output += `${JSON.stringify(item, null, 2)}`

    return output
}

export default class Config extends SlashCommand {
    constructor(client: BetterClient) {
        super("create", client, {
            description: `Create an item or box`,
            guildOnly: true,
            options: [
                {
                    type: "SUB_COMMAND",
                    name: "item",
                    description: "Create an item",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the item",
                            required: true,
                        },
                        {
                            type: "STRING",
                            name: "description",
                            description: "The description of the item",
                        },
                        {
                            type: "STRING",
                            name: "emoji",
                            description: "The emoji of the item",
                        },
                        {
                            type: "NUMBER",
                            name: "feed-value",
                            description: "If you can /feed this item, how many entries does it give?",
                        },
                        {
                            type: "STRING",
                            name: "redeem-items",
                            description: "List the items and their values, in the format \"name-amount\", separating each item with commas",
                        },
                        {
                            type: "NUMBER",
                            name: "play-chance",
                            description: "The chance of this item being given in /play",
                        },
                    ],
                },
                {
                    type: "SUB_COMMAND",
                    name: "box",
                    description: "Create a box",
                    options: [
                        {
                            type: "STRING",
                            name: "name",
                            description: "The name of the box",
                            required: true,
                        },
                    ],
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const type = interaction.options.getSubcommand(false)
        const name = interaction.options.getString("name") || ""

        switch (type) {
        case "item":
            const description = interaction.options.getString("description")
            const emoji = interaction.options.getString("emoji")
            const feedValue = interaction.options.getNumber("feed-value")
            const redeemItems = interaction.options.getString("redeem-items")
            const playChance = interaction.options.getNumber("play-chance")
            const itemData: Prisma.ItemCreateInput = {
                name,
                description,
            }
            if (description) itemData.description = description
            if (emoji) itemData.emoji = emoji
            if (feedValue) {
                itemData.feedValue = feedValue
                itemData.feedable = true
            }
            if (redeemItems) {
                itemData.redeemItems = redeemItems
                itemData.redeemable = true
            }
            if (playChance) itemData.playChance = playChance

            const itemResult = await this.client.prisma.item.create({
                data: itemData,
            })
            interaction.editReply({
                content: `The item has been created with the ID \`${
                    itemResult.id
                }\`, [click here to see the resulting data](${await this.client.functions.uploadHaste(itemHaste(itemResult), "txt")}).`,
            })
            break

        case "box":
            break

        default:
            break
        }
    }
}
