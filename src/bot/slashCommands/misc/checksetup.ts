import { GiveawayType } from "@prisma/client"
import { CommandInteraction, MessageEmbed } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/TuskClient"

export default class Config extends SlashCommand {
    constructor(client: BetterClient) {
        super("checksetup", client, {
            description: `Check your guild's setup`,
            guildOnly: true,
            permissions: ["MANAGE_GUILD"],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        if (!interaction.guild) return
        const guildSettings = await this.client.prisma.guild.findFirst({
            where: {
                id: interaction.guild.id,
            },
            include: {
                giveawaySettings: true,
            },
        })

        if (!guildSettings || !guildSettings.initialSetup) return interaction.editReply({ content: "This guild has not yet been setup!" })

        const embed = new MessageEmbed({ title: `${interaction.guild.name}'s Settings`, color: "RANDOM", footer: { text: this.client.user?.tag } })
        embed.setThumbnail(interaction.guild.iconURL({ dynamic: true }) || this.client.user?.displayAvatarURL() || "").setTimestamp()
        const gwaSettings = guildSettings?.giveawaySettings
        if (!gwaSettings) {
            embed.setDescription(`No giveaway settings found for this guild.`)
            return interaction.editReply({ embeds: [embed] })
        }

        Object.keys(GiveawayType).forEach((type) => {
            const typeName = this.client.functions.titleCase(type)
            const setting = gwaSettings.find((s) => s.type === type)
            const canSend = false
            const canPing = false
            if (setting) {
                embed.addField(
                    `${typeName}`,
                    `Role: <@&${setting.ping}>\n${this.client.functions.emojiList([
                        `Channel: <#${setting.channel}>`,
                        `Can send: **${this.client.functions.titleCase(`${canSend}`)}**`,
                        `Can ping: **${this.client.functions.titleCase(`${canPing}`)}**`,
                    ])}\n`
                )
            } else {
                embed.addField(`${typeName}`, `This type of giveaway has not yet been setup!`)
            }
        })

        interaction.editReply({ embeds: [embed] })
    }
}
