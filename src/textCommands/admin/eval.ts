import { inspect } from "node:util"
import { type BetterClient, TextCommand, Type } from "~/lib"
import * as lib from "~/lib"
import * as config from "~/config"
import db from "~/database"
import * as database from "~/database"
import { logger } from "~/logger"
import { EmbedBuilder, type Message } from "discord.js"
import * as generateMessage from "~/functions/generateMessage"
import * as generateTimestamp from "~/functions/generateTimestamp"
import * as getFiles from "~/functions/getFiles"
import * as getPermissionName from "~/functions/getPermissionName"
import * as isAdmin from "~/functions/isAdmin"
import * as paginator from "~/functions/paginator"
import * as parseUser from "~/functions/parseUser"
import * as randomInt from "~/functions/randomInt"
import * as shuffle from "~/functions/shuffle"
import * as titleCase from "~/functions/titleCase"
import * as uploadHaste from "~/functions/uploadHaste"


const bot = {
	db,
	database,
	config,
	lib,
	logger,
	functions: {
		...generateMessage,
		...generateTimestamp,
		...getFiles,
		...getPermissionName,
		...isAdmin,
		...paginator,
		...parseUser,
		...randomInt,
		...shuffle,
		...titleCase,
		...uploadHaste
	}
}

export default class Eval extends TextCommand {
	constructor(client: BetterClient) {
		super("eval", client, {
		})

		logger.null(bot)
	}

	override async run(message: Message, args: string[]) {
		if (!config.admins.includes(message.author.id)) return
		logger.info(
			`${message.author.tag} ran eval in ${message.guild?.name} ${message.guild?.id
			}, ${args.join(" ")}`
		)

		const { success, result, type } = await this.eval(message, args.join(" "))
		if (message.content.includes("--silent")) return null

		if (result.length > 4087) {
			return message.reply({
				embeds: [
					new EmbedBuilder({
						title: success
							? "🆗 Evaluated successfully."
							: "🆘 JavaScript failed.",
						description: `Output too long for Discord, view it [here](${await bot.functions.uploadHaste(
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

	private async eval(message: Message, code: string) {
		// if (message.id === user.id) {
		//     logger.info("Eval has been executed")
		// }
		// biome-ignore lint/suspicious/noImplicitAnyLet: any
		let success
		// biome-ignore lint/suspicious/noImplicitAnyLet: any
		let result
		// biome-ignore lint/suspicious/noImplicitAnyLet: any
		let type
		try {
			if (message.content.includes("--async"))
				// biome-ignore lint/style/noParameterAssign: <explanation>
				code = `(async () => {\n${code}\n})();`
			// biome-ignore lint/security/noGlobalEval: <explanation>
			result = eval(code)
			type = new Type(result)
			if (this.isThenable(result)) {
				result = await result
				type.addValue(result)
			}
			success = true
			// biome-ignore lint/suspicious/noExplicitAny: any
		} catch (error: any) {
			if (!type) type = new Type(error)
			if (error?.stack) this.client.emit("error", error.stack)
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

	// biome-ignore lint/suspicious/noExplicitAny: any
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
