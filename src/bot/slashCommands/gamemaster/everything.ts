import { CommandInteraction, MessageEmbed } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("everything", client, {
            description: `See a list of *everything*`,
            options: [
                {
                    type: "BOOLEAN",
                    name: "text-only",
                    description: "Only show the text",
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        const rolesData = await this.client.prisma.role.findMany()
        const playersData = await this.client.prisma.player.findMany({})
        const itemsData = await this.client.prisma.item.findMany()

        const roles = rolesData.map((role) => role.name)
        const items = itemsData.map((item) => item.name)
        const players = playersData.map((player) => ` ${player.deathStatus ? "😃" : "💀"} ${player.name}`)
        const votes = playersData.map((player) =>
            (player.votedForName
                ? `${player.name} - ${player.voteWorth} vote${player.voteWorth === 1 ? "" : "s"} for ${player.votedForName}`
                : `${player.name} - No vote`))

        const doText = interaction.options.getBoolean("text-only", false) || false

        if (doText) {
            return interaction.editReply(
                `Roles: ${roles.join(", ")}\nItems: ${items.join(", ")}\nVotes: ${votes.join(", ")}\n\nPlayers:\n${players.join("\n")}`
            )
        }
        interaction.editReply({
            embeds: [
                new MessageEmbed().setTitle("Roles").setColor("RANDOM").setDescription(roles.join("\n")),
                new MessageEmbed().setTitle("Players").setColor("RANDOM").setDescription(players.join("\n")),
                new MessageEmbed().setTitle("Votes").setColor("RANDOM").setDescription(votes.join("\n")),
                new MessageEmbed().setTitle("Items").setColor("RANDOM").setDescription(items.join("\n")),
            ],
        })
    }
}
