import {
	ActionRowBuilder,
	APIEmbed,
	ButtonBuilder,
	EmbedBuilder
} from "discord.js"
import { GeneratedMessage } from "../index.js"
import { colors } from "@internal/config"
import { logger } from "@internal/logger"

/**
 * Generate a full error message with a simple helper function.
 * @param embedInfo - The information to build our embed with.
 * @param supportServer - Whether or not to add the support server link as a component.
 * @param components - The components for our message.
 * @param ephemeral - Whether our message should be ephemeral or not.
 * @returns The generated error message.
 */
export const generateErrorMessage = (
	embedInfo: APIEmbed,
	supportServer = true,
	ephemeral = true
): GeneratedMessage => {
	logger.null(supportServer)
	return {
		embeds: [new EmbedBuilder(embedInfo).setColor(colors.error).data],
		ephemeral
	}
}

export const generateSuccessMessage = (
	embedInfo: APIEmbed,
	components: ActionRowBuilder<ButtonBuilder>[] = [],
	ephemeral = false
): GeneratedMessage => {
	return {
		embeds: [new EmbedBuilder(embedInfo).setColor(colors.success).data],
		components,
		ephemeral
	}
}

export const generateWarningMessage = (
	embedInfo: APIEmbed,
	components: ActionRowBuilder<ButtonBuilder>[] = [],
	ephemeral = false
): GeneratedMessage => {
	return {
		embeds: [new EmbedBuilder(embedInfo).setColor(colors.warning).data],
		components,
		ephemeral
	}
}
