import { Death } from "@prisma/client"
import { CommandInteraction, TextChannel } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/BlobbyClient"

export default class Ping extends SlashCommand {
    constructor(client: BetterClient) {
        super("rob", client, {
            description: `Initiate a robbery`,
            options: [
                {
                    type: "STRING",
                    name: "who",
                    description: "Who is being robbed?",
                    required: true,
                    autocomplete: true,
                },
                {
                    type: "STRING",
                    name: "by",
                    description: "Who is doing the robbing?",
                    required: true,
                    autocomplete: true,
                },
                {
                    type: "NUMBER",
                    name: "amount",
                    description: "How much is being stolen?",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true })
        if (!this.client.user || !interaction.channel) return

        const who = interaction.options.getString("who", true)
        const by = interaction.options.getString("by", true)
        const amountInput = interaction.options.getNumber("amount", true)

        const whoPlayer = await this.client.prisma.player.findUnique({
            where: {
                name: who,
            },
        })
        const byPlayer = await this.client.prisma.player.findUnique({
            where: {
                name: by,
            },
        })
        if (!whoPlayer) {
            return interaction.editReply(`Player ${who} does not exist.`)
        }
        if (!byPlayer) {
            return interaction.editReply(`Player ${by} does not exist.`)
        }
        if (whoPlayer.name === byPlayer.name) {
            return interaction.editReply(`You cannot rob yourself.`)
        }
        if (byPlayer.deathStatus === Death.DEAD) {
            return interaction.editReply(`Player ${by} is dead.`)
        }
        if (whoPlayer.deathStatus === Death.DEAD) {
            return interaction.editReply(`Player ${who} is dead. Are you trying to use </loot:1061026940045242448>?`)
        }
        if (!whoPlayer.discordId) {
            return interaction.editReply(`Player ${who} does not have a Discord account linked.`)
        }
        if (!byPlayer.discordId) {
            return interaction.editReply(`Player ${by} does not have a Discord account linked.`)
        }

        const amount = amountInput > whoPlayer.money ? whoPlayer.money : amountInput

        const whoChannelName = who.replace(/ /g, "-").toLowerCase()
        const whoChannel = interaction.guild?.channels.cache.find((c) => c.name === `gm-${whoChannelName}`) as TextChannel
        if (!whoChannel) {
            interaction.followUp(`Couldn't find GM channel for ${who}!`)
        }
        const byChannelName = by.replace(/ /g, "-").toLowerCase()
        const byChannel = interaction.guild?.channels.cache.find((c) => c.name === `gm-${byChannelName}`) as TextChannel
        if (!byChannel) {
            interaction.followUp(`Couldn't find GM channel for ${by}!`)
        }

        const time = 60000 * Math.ceil(amountInput / 5)
        const timestamp = Date.now() + time
        const timeCounter = this.client.functions.generateTimestamp({
            type: "R",
            timestamp,
        })
        const timeString = this.client.functions.generateTimestamp({
            type: "T",
            timestamp,
        })
        const send = `<a:siren:1084362013247033405> <@${whoPlayer.discordId}>, YOU ARE BEING ROBBED! <a:siren:1084362013247033405> \nSend any message here to stop the robbery! Time is up ${timeCounter} (at ${timeString})!`
        let msg
        try {
            msg = await whoChannel.send(send)
        } catch (e) {
            return interaction.editReply(`Failed to send message to ${whoChannel}.`)
        }
        if (!msg) return

        await interaction.editReply(
            `[Robbery initiated! (Click me)](https://discord.com/channels/${interaction.guildId}/${whoChannel.id}/${msg.id})\nTime: ${
                time / 1000
            } seconds`
        )

        await byChannel.send(`<@${byPlayer.discordId}>, you are now robbing ${who}! Time is up ${timeCounter} (at ${timeString})!`)

        const collected = await whoChannel.awaitMessages({ filter: (m) => m.author.id === whoPlayer.discordId, time, max: 1 })
        if (collected.size > 0) {
            // robbery failed
            whoChannel.send(`You have stopped the robbery! ${by} failed to rob you!`)
            byChannel.send(`<@${byPlayer.discordId}>, you have failed to rob ${who}!`)
            this.client.logger.gameLog(`${by} failed to rob ${who}!`)
        } else if (amount === 0) {
            whoChannel.send(`You failed to stop the robbery, but you had no money for them to take!`)
            byChannel.send(`<@${byPlayer.discordId}>, you have robbed ${who}, however, they had no money for you to take!`)
            this.client.logger.gameLog(`${by} robbed ${who}, however, they had no money for them to take!`)
        } else {
            // robbery success, money
            whoChannel.send(`You failed to stop the robbery, and they took $${amount} from you!`)
            byChannel.send(`<@${byPlayer.discordId}>, you have robbed ${who} and taken $${amount} from them!`)
            await this.client.prisma.player.update({
                where: {
                    name: whoPlayer.name,
                },
                data: {
                    money: whoPlayer.money - amount,
                },
            })

            await this.client.prisma.player.update({
                where: {
                    name: byPlayer.name,
                },
                data: {
                    money: byPlayer.money + amount,
                },
            })

            this.client.logger.gameLog(`${by} robbed ${who} and took $${amount} from them!`)
        }

        await this.client.prisma.player.update({
            where: {
                name: byPlayer.name,
            },
            data: {
                robberiesLeft: byPlayer.robberiesLeft - 1,
            },
        })
    }
}
