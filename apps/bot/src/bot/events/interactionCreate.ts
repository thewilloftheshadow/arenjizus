import { EventHandler } from "@buape/lib"
import { generateErrorMessage } from "@internal/functions"
import { logger } from "@internal/logger"
import {
	type ChatInputCommandInteraction,
	type Interaction,
	InteractionType
} from "discord.js"

export default class InteractionCreate extends EventHandler {
	override async run(interaction: Interaction) {
		logger.info(
			`${interaction.type} interaction created by ${interaction.user.id}${
				interaction.type === InteractionType.ApplicationCommand
					? `: ${interaction.toString()}`
					: ""
			}`
		)
		if (!interaction.guild) return

		if (interaction.type === InteractionType.ModalSubmit) {
			return this.client.modalSubmitHandler.handleModal(interaction)
		}
		if (interaction.type === InteractionType.ApplicationCommand) {
			return this.client.applicationCommandHandler.handleComponent(
				interaction as ChatInputCommandInteraction
			)
		}
		if (interaction.type === InteractionType.MessageComponent) {
			if (interaction.isButton()) {
				return this.client.buttonHandler.handleComponent(interaction)
			}
			if (interaction.isAnySelectMenu()) {
				return this.client.dropdownHandler.handleComponent(interaction)
			}
		}
		if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
			return this.client.autocompleteHandler.handleAutocomplete(interaction)
		}

		logger.thrownError(
			new Error("Invalid Interaction: Never seen this before.")
		)
		// @ts-ignore
		return interaction.isRepliable()
			? // @ts-ignore
				interaction.reply(
					generateErrorMessage(
						{
							title: "Invalid Interaction",
							description: "I've never seen this type of interaction"
						},
						true
					)
				)
			: logger.warn(`Interaction was not repliable`)
	}
}
