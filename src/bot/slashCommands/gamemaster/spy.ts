import { CommandInteraction, TextChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

// eslint-disable-next-line no-promise-executor-return
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("spy", client, {
            description: `Send messages from one channel into another`,
            options: [
                {
                    type: "CHANNEL",
                    name: "channel",
                    description: "The channel to send from",
                    required: true,
                    channelTypes: ["GUILD_TEXT"],
                },
                {
                    type: "NUMBER",
                    name: "amount",
                    description: "The amount of messages to send (default is 5, max is 20)",
                    required: false,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        if (!this.client.user || !interaction.channel) return
        const thisChannel = interaction.channel as TextChannel
        const channel = interaction.options.getChannel("channel", true) as TextChannel
        const amount = interaction.options.getNumber("amount", false) || 5

        if (amount > 50) return interaction.editReply("You can only send 20 messages at a time")

        const raw = await channel.messages.fetch({ limit: 50 })

        const messages = raw
            .sort((a, b) => b.createdTimestamp - a.createdTimestamp)
            .first(amount)
            .reverse()

        const hooks = await thisChannel.fetchWebhooks()
        let hook = hooks.find((h) => h.owner?.id === this.client.user?.id)
        if (!hook) hook = await thisChannel.createWebhook(this.client.user.username, { avatar: this.client.user.displayAvatarURL() })

        this.client.logger.gameLog(`Spying on <#${channel.id}> for ${amount} messages in <#${thisChannel}>`)

        thisChannel.send("*Beginning transmission...*")

        // eslint-disable-next-line no-restricted-syntax
        for await (const message of messages) {
            await sleep(3000)
            await hook.send({
                content: message.content || "** **",
                attachments: message.attachments.map((x) => x),
                embeds: message.embeds.map((x) => x),
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL(),
            })
        }

        thisChannel.send("*End of transmission...*")

        await interaction.editReply("Done!")
    }
}
