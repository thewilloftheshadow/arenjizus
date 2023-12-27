import * as config from "@internal/config"
import { TextCommand, BetterClient, Type } from "@buape/lib"
import { logger, DebugType } from "@internal/logger"
import { Message, EmbedBuilder } from "discord.js"
import { inspect } from "util"
import db from "@internal/database"
import * as database from "@internal/database"
import * as lib from "@buape/lib"
import * as functions from "@internal/functions"
const bot = {
	db,
	database,
	config,
	lib,
	functions,
	logger: { logger, DebugType }
}

export default class Eval extends TextCommand {
	constructor(client: BetterClient) {
		super("eval", client, {
			restriction: "gamemaster"
		})

		logger.null(bot)
	}

	override async run(message: Message, args: string[]) {
		logger.info(
			`${message.author.tag} ran eval in ${message.guild?.name} ${
				message.guild?.id
			}, ${args.join(" ")}`
		)
		logger.null(`${DebugType.GENERAL}`)

		const { success, result, type } = await this.eval(message, args.join(" "))
		if (message.content.includes("--silent")) return null

		if (result.length > 4087) {
			return message.reply({
				embeds: [
					new EmbedBuilder({
						title: success
							? "🆗 Evaluated successfully."
							: "🆘 JavaScript failed.",
						description: `Output too long for Discord, view it [here](${await functions.uploadHaste(
							result,
							"js"
						)})`,
						fields: [
							{
								name: "Type",
								value: `\`\`\`ts\n${type}\`\`\``
							}
						],
						color: success ? config.colors.success : config.colors.error
					})
				]
			})
		}

		return message.reply({
			embeds: [
				new EmbedBuilder({
					title: success
						? "🆗 Evaluated successfully."
						: "🆘 JavaScript failed.",
					description: `\`\`\`js\n${result}\`\`\``,
					fields: [
						{
							name: "Type",
							value: `\`\`\`ts\n${type}\`\`\``
						}
					],
					color: success ? config.colors.success : config.colors.error
				})
			]
		})
	}

	private async eval(message: Message, codeInput: string) {
		// if (message.id === user.id) {
		//     logger.info("Eval has been executed")
		// }
		let code = codeInput.replace(/[“”]/g, `"`).replace(/[‘’]/g, "'")
		let success
		let result
		let type
		try {
			if (message.content.includes("--async"))
				code = `(async () => {\n${code}\n})();`
			result = eval(code)
			type = new Type(result)
			if (this.isThenable(result)) {
				result = await result
				type.addValue(result)
			}
			success = true
		} catch (error: any) {
			if (!type) type = new Type(error)
			if (error && error.stack) this.client.emit("error", error.stack)
			result = error
			success = false
		}

		return {
			success,
			type,
			result: this.parseContent(inspect(result))
		}
	}

	/**
	 * Parse the content of a string to remove all private information.
	 * @param content - The content to parse.
	 * @returns The parsed content.
	 */
	private parseContent(content: string): string {
		return content.replace(this.client.token || "", "[ T O K E N ]")
	}

	private isThenable(input: any): boolean {
		if (!input) return false
		return (
			input instanceof Promise ||
			(input !== Promise.prototype &&
				this.isFunction(input.then) &&
				this.isFunction(input.catch))
		)
	}

	public isFunction(input: unknown): boolean {
		return typeof input === "function"
	}
}
