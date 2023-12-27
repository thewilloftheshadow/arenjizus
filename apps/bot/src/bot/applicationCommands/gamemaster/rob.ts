import { Death } from "@prisma/client"
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from "discord.js"
import { logger } from "@internal/logger"
import { ApplicationCommand } from "@buape/lib"
import { ApplicationCommandOptionType } from "discord.js"
import { BetterClient } from "@buape/lib"
import database, {
	addMoney,
	getAllPlayers,
	getPlayer,
	removeMoney
} from "@internal/database"
import { generateTimestamp, getPlayerChannel } from "@internal/functions"
import { serverIds } from "@internal/config"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("rob", client, {
			description: `Initiate a robbery`,
			restriction: "player",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "who",
					description: "Who do you want to rob?",
					required: true,
					autocomplete: true
				},
				{
					type: ApplicationCommandOptionType.Integer,
					name: "amount",
					description: "How much do you want to attempt to steal?",
					required: true
				}
			]
		})
	}

	override async autocomplete(
		interaction: AutocompleteInteraction,
		option: AutocompleteFocusedOption
	) {
		switch (option.name) {
			case "by":
			case "who":
				const allPlayers = await getAllPlayers()
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction.respond(
						players.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
				}
				return interaction.respond(
					allPlayers.map((player: { name: string }) => ({
						name: player.name,
						value: player.name
					}))
				)
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			content: `Robbery has begun...`,
			ephemeral: true
		})
		if (!this.client.user || !interaction.channel) return

		const who = interaction.options.getString("who", true)
		const by = interaction.options.getString("by", true)
		const amountInput = interaction.options.getInteger("amount", true)

		const whoPlayer = await getPlayer(who)
		const byPlayer = await getPlayer(by)
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
			return interaction.editReply(
				`Player ${who} is dead. Are you trying to use </loot:1061026940045242448>?`
			)
		}
		if (!whoPlayer.discordId) {
			return interaction.editReply(
				`Player ${who} does not have a Discord account linked.`
			)
		}
		if (!byPlayer.discordId) {
			return interaction.editReply(
				`Player ${by} does not have a Discord account linked.`
			)
		}

		const amount = amountInput > whoPlayer.money ? whoPlayer.money : amountInput

		const whoChannelName = who.replace(/ /g, "-").toLowerCase()
		const whoChannel = await getPlayerChannel(whoChannelName, this.client)
		if (!whoChannel) {
			return interaction.followUp(`Couldn't find GM channel for ${who}!`)
		}

		const time = 60000 * Math.ceil(amountInput / 5)
		const timestamp = Date.now() + time
		const timeCounter = generateTimestamp({
			type: "R",
			timestamp
		})
		const timeString = generateTimestamp({
			type: "T",
			timestamp
		})
		const send = `<a:siren:1084362013247033405> <@${whoPlayer.discordId}>, YOU ARE BEING ROBBED! <a:siren:1084362013247033405> \nSend any message here to stop the robbery! Time is up ${timeCounter} (at ${timeString})!`
		let msg
		try {
			msg = await whoChannel.send(send)
		} catch (e) {
			return interaction.editReply(`Failed to send message to ${whoChannel}.`)
		}
		if (!msg) return

		await interaction.followUp(
			`<@${byPlayer.discordId}>, you are now robbing ${who}! Time is up ${timeCounter} (at ${timeString})! || <@&${serverIds.roles.gamemaster}>}`
		)

		const collected = await whoChannel.awaitMessages({
			filter: (m) => m.author.id === whoPlayer.discordId,
			time,
			max: 1
		})
		if (collected.size > 0) {
			// robbery failed
			whoChannel.send(`You have stopped the robbery! ${by} failed to rob you!`)
			interaction.followUp(
				`<@${byPlayer.discordId}>, you have failed to rob ${who}!`
			)
			logger.gameLog(`${by} failed to rob ${who}!`)
		} else if (amount === 0) {
			whoChannel.send(
				`You failed to stop the robbery, but you had no money for them to take!`
			)
			interaction.followUp(
				`<@${byPlayer.discordId}>, you have robbed ${who}, however, they had no money for you to take!`
			)
			logger.gameLog(
				`${by} robbed ${who}, however, they had no money for them to take!`
			)
		} else {
			// robbery success, money
			whoChannel.send(
				`You failed to stop the robbery, and they took $${amount} from you!`
			)
			interaction.followUp(
				`<@${byPlayer.discordId}>, you have robbed ${who} and taken $${amount} from them!`
			)
			removeMoney(whoPlayer.name, amount)
			addMoney(byPlayer.name, amount)

			logger.gameLog(`${by} robbed ${who} and took $${amount} from them!`)
		}

		await database.player.update({
			where: {
				name: byPlayer.name
			},
			data: {
				robberiesLeft: byPlayer.robberiesLeft - 1
			}
		})
	}
}
