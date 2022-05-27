import { GiveawayType } from "@prisma/client"
import { CommandInteraction, GuildTextBasedChannel, Role } from "discord.js"
import SlashCommand from "../../../../lib/classes/SlashCommand"
import BetterClient from "../../../../lib/extensions/TuskClient"

export default class Config extends SlashCommand {
    constructor(client: BetterClient) {
        super("setup", client, {
            description: `Change the guild's settings`,
            guildOnly: true,
            permissions: ["MANAGE_GUILD"],
            options: [
                {
                    type: "STRING",
                    name: "type",
                    description: "The type of giveaway to setup",
                    required: true,
                    choices: Object.keys(GiveawayType).map((k) => ({ name: client.functions.titleCase(k), value: k })),
                },
                {
                    type: "CHANNEL",
                    name: "channel",
                    description: "The channel for this giveaway type to be sent to",
                    required: true,
                    channelTypes: ["GUILD_TEXT", "GUILD_NEWS"],
                },
                {
                    type: "ROLE",
                    name: "role",
                    description: "The role to ping for this giveaway type",
                    required: true,
                },
            ],
        })
    }

    override async run(interaction: CommandInteraction) {
        await interaction.deferReply()
        if (!interaction.guild) return
        const type = interaction.options.getString("type") as GiveawayType
        const channel = interaction.options.getChannel("channel") as GuildTextBasedChannel
        const role = interaction.options.getRole("role") as Role

        const guild = await this.client.prisma.guild.findFirst({
            where: {
                id: interaction.guild.id,
            },
        })

        if (!guild) {
            await this.client.prisma.guild.create({
                data: {
                    id: interaction.guild.id,
                    initialSetup: true,
                },
            })
        } else {
            await this.client.prisma.guild.update({
                where: {
                    id: interaction.guild.id,
                },
                data: {
                    initialSetup: true,
                },
            })
        }
        await this.client.prisma.giveawaySetting.deleteMany({
            where: {
                type,
                guildId: interaction.guild.id,
            },
        })
        await this.client.prisma.giveawaySetting.create({
            data: {
                type,
                guildId: interaction.guild.id,
                channel: channel.id,
                ping: role.id,
            },
        })

        return interaction.editReply(
            this.client.functions.generateSuccessMessage({
                title: "Success",
                description: `Set up ${type} giveaways in ${channel.name} with ${role.name} as the ping`,
            })
        )
    }
}
