import {
	type APIEmbed,
	EmbedBuilder,
	type InteractionEditReplyOptions
} from "discord.js"
import { colors } from "~/config"
import { logger } from "~/logger"

export type GeneratedMessage = Omit<
	InteractionEditReplyOptions,
	"flags" | "fetchReply"
> & {
	ephemeral?: boolean
}

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
	components: NonNullable<InteractionEditReplyOptions["components"]> = [],
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
	components: NonNullable<InteractionEditReplyOptions["components"]> = [],
	ephemeral = false
): GeneratedMessage => {
	return {
		embeds: [new EmbedBuilder(embedInfo).setColor(colors.warning).data],
		components,
		ephemeral
	}
}
