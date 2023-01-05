import { CommandInteraction, TextChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("askeveryone", client, {
            description: `Ask everyone something, Office cutaway style`,
            options: [
                {
                    type: "STRING",
                    name: "question",
                    description: "The question to ask",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.reply(`Sending...`)
        if (!interaction.guild) return
        const players = await this.client.prisma.player.findMany()

        players.forEach((x) => {
            const user = x.discordId
            if (!user) return
            const name = x.name.replace(/ /g, "-").toLowerCase()
            const theirChannel = interaction.guild?.channels.cache.find((c) => c.name === `gm-${name}`)
            if (!theirChannel) {
                interaction.followUp(`Couldn't find channel for ${x.name} (${user})!`)
            } else {
                const sendChannel = theirChannel as TextChannel
                sendChannel.send({ content: `<@${user}>\n${interaction.options.getString("question", true)}`, allowedMentions: { users: [user] } })
            }
        })

        const gm = interaction.guild.channels.cache.find((x) => x.name === "gm-gamemasters") as TextChannel
        gm.send({
            content: `<@&1058507082917216326>\n${interaction.options.getString("question", true)}`,
            allowedMentions: { roles: ["1058507082917216326"] },
        })
    }
}
