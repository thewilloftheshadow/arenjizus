import type {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from "discord.js"
import { ApplicationCommandOptionType } from "discord.js"
import { serverIds } from "~/config"
import database, {} from "~/database"
import { getAllPlayers, getDiscordPlayer, getPlayer } from "~/database/getData"
import { addMoney, removeMoney } from "~/database/thingys"
import { generateTimestamp } from "~/functions/generateTimestamp"
import { getPlayerChannel } from "~/functions/player"
import { ApplicationCommand } from "~/lib"
import type { BetterClient } from "~/lib"
import { logger } from "~/logger"

export default class Ping extends ApplicationCommand {
	constructor(client: BetterClient) {
		super("rob", client, {
			description: `Initiate a robbery`,
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
		const allPlayers = await getAllPlayers()
		switch (option.name) {
			case "by":
			case "who":
				if (option.value) {
					const players = allPlayers.filter((player: { name: string }) =>
						player.name.toLowerCase().includes(option.value.toLowerCase())
					)
					return interaction
						.respond(
							players.map((player: { name: string }) => ({
								name: player.name,
								value: player.name
							}))
						)
						.catch(() => {})
				}
				return interaction
					.respond(
						allPlayers.map((player: { name: string }) => ({
							name: player.name,
							value: player.name
						}))
					)
					.catch(() => {})
		}
	}

	override async run(interaction: ChatInputCommandInteraction) {
		if (
			!this.client.user ||
			!interaction.channel ||
			!interaction.channel.isSendable()
		)
			return
		await interaction.reply({
			content: `Robbery has begun...`,
			ephemeral: true
		})

		const isDay = (
			await database.keyV.upsert({
				where: {
					key: "voteEnabled"
				},
				create: {
					key: "voteEnabled",
					valueBoolean: false
				},
				update: {}
			})
		).valueBoolean

		const who = interaction.options.getString("who", true)
		const amountInput = interaction.options.getInteger("amount", true)

		const whoPlayer = await getPlayer(who)
		const byPlayer = await getDiscordPlayer(interaction.user.id)
		if (!whoPlayer) {
			return interaction.editReply(`Player ${who} does not exist.`)
		}
		if (!byPlayer) {
			return interaction.editReply(`You are not a player!`)
		}
		if (whoPlayer.name === byPlayer.name) {
			return interaction.editReply(`You cannot rob yourself.`)
		}
		if (!byPlayer.isAlive && !byPlayer.isFaked) {
			return interaction.editReply(`You are dead.`)
		}
		if (!whoPlayer.isAlive && !whoPlayer.isFaked) {
			return interaction.editReply(
				`Player ${who} is dead. Are you trying to use </loot:1061026940045242448>?`
			)
		}
		if (!whoPlayer.discordId) {
			return interaction.editReply(
				`Player ${who} does not have a Discord account linked.`
			)
		}

		if (!isDay && whoPlayer.locationId !== byPlayer.locationId) {
			return interaction.editReply(
				`You are not in the same location as ${who}.`
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
		const msg = await whoChannel.send(send).catch((_e) => {
			return interaction.editReply(`Failed to send message to ${whoChannel}.`)
		})
		if (!msg) return

		await interaction.channel.send({
			content: `<@${byPlayer.discordId}>, you are now robbing ${who} for $${amountInput}! Time is up ${timeCounter} (at ${timeString})! ||<@&${serverIds.roles.gamemaster}>||`,
			allowedMentions: {
				users: [interaction.user.id],
				roles: [serverIds.roles.gamemaster]
			}
		})

		const collected = await whoChannel.awaitMessages({
			filter: (m) => m.author.id === whoPlayer.discordId,
			time,
			max: 1
		})
		if (collected.size > 0) {
			// robbery failed
			whoChannel.send(
				`You have stopped the robbery! ${byPlayer.name} failed to rob you!`
			)
			interaction.followUp(
				`<@${byPlayer.discordId}>, you have failed to rob ${who}!`
			)
			logger.gameLog(`${byPlayer.name} failed to rob ${who}!`)
		} else if (amount === 0) {
			whoChannel.send(
				`You failed to stop the robbery, but you had no money for them to take!`
			)
			interaction.followUp(
				`<@${byPlayer.discordId}>, you have robbed ${who}, however, they had no money for you to take!`
			)
			logger.gameLog(
				`${byPlayer.name} robbed ${who}, however, they had no money for them to take!`
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

			logger.gameLog(
				`${byPlayer.name} robbed ${who} and took $${amount} from them!`
			)
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
