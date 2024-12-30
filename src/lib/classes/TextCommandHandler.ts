import path from "node:path"
import type { Message } from "discord.js"
import { generateErrorMessage } from "~/functions/generateMessage"
import { getFiles } from "~/functions/getFiles"
import { type BetterClient, LogLevel, type TextCommand } from "../"

export default class TextCommandHandler {
	public client: BetterClient
	private customPrefix?: string

	constructor(client: BetterClient, prefix?: string) {
		this.client = client
		this.customPrefix = prefix
	}

	public async loadFiles() {
		try {
			const parentFolders = getFiles("textCommands", "", true)

			for (const parentFolder of parentFolders) {
				const files = getFiles(path.join("textCommands", parentFolder), "ts")

				for (const fileName of files) {
					const fileUrl = `../../textCommands/${parentFolder}/${fileName}`
					const textCommands = await import(fileUrl)
					const textCommand = new textCommands.default(this.client)
					this.client.textCommands.set(textCommand.key, textCommand)
				}
			}
		} catch (e) {
			console.error(e)
			this.client.log(
				"Failed to load files for textCommands handler",
				LogLevel.WARN
			)
		}
	}

	public reloadFiles() {
		this.client.textCommands.clear()
		this.loadFiles()
	}

	public fetchCommand(key: string) {
		return this.client.textCommands.get(key) || undefined
	}

	public async handle(message: Message) {
		const prefix = this.customPrefix ?? `<@${this.client.user?.id}> `
		if (!prefix || !message.content.startsWith(prefix)) return
		const args = message.content.slice(prefix.length).trim().split(/ +/g)
		const commandName = args.shift()?.toLowerCase()
		const command = this.fetchCommand(commandName || "")
		if (!command) return

		const missingPermissions = await command.validate(message)
		if (missingPermissions)
			return message.reply(generateErrorMessage(missingPermissions))

		return this.runCommand(command, message, args)
	}

	private async runCommand(
		command: TextCommand,
		message: Message,
		args: string[]
	) {
		this.client.usersUsingBot.add(message.author.id)
		// biome-ignore lint/suspicious/noExplicitAny: This can truly be any
		await command.run(message, args).catch(async (error: any): Promise<any> => {
			this.client.log(`${error}`, LogLevel.ERROR)
			if (error instanceof Error)
				this.client.log(`${error.stack}`, LogLevel.ERROR)
			return message.reply(
				generateErrorMessage({
					title: "An Error Has Occurred",
					description: `An unexpected error was encountered while running the \`${command.key}\` command. Please try again later. If the problem persists, please contact support.`
				})
			)
		})
		this.client.usersUsingBot.delete(message.author.id)
	}
}
