import path from "node:path"
import {
	type AnySelectMenuInteraction,
	type ButtonInteraction,
	type CommandInteraction,
	Message
} from "discord.js"
import { generateErrorMessage } from "~/functions/generateMessage"
import { getFiles } from "~/functions/getFiles"
import {
	type ApplicationCommand,
	type BetterClient,
	type Button,
	type Dropdown,
	type HandlerType,
	LogLevel,
	type _BaseComponent
} from "../"

export default class BaseHandler {
	private type: HandlerType
	public client: BetterClient

	constructor(type: HandlerType, client: BetterClient) {
		this.type = type
		this.client = client
	}

	public async loadFiles() {
		try {
			const typePath = `${this.type}`
			const parentFolders = getFiles(typePath, "", true)

			for (const parentFolder of parentFolders) {
				const files = getFiles(path.join(typePath, parentFolder), "ts")

				for (const fileName of files) {
					const fileUrl = `../../${this.type}/${parentFolder}/${fileName}`
					const file = await import(fileUrl)
					const component = new file.default(this.client)
					this.client[this.type].set(component.key, component)
				}
			}
		} catch (error) {
			console.error(error)
			this.client.log(
				`Failed to load files for ${this.type} handler`,
				LogLevel.WARN
			)
		}
		this.postLoad()
	}

	public postLoad() {}

	public reloadFiles() {
		this.client[this.type].clear()
		this.loadFiles()
	}

	public fetchComponent(key: string) {
		return this.client[this.type].get(key) || undefined
	}

	// Override in specific handlers
	public async specificChecks(
		interaction:
			| ButtonInteraction
			| AnySelectMenuInteraction
			| CommandInteraction,
		component: _BaseComponent
	): Promise<unknown> {
		return this.client.log(`${interaction}${component}`, LogLevel.NULL) // This line is here to prevent unused variable errors
	}

	public async handleComponent(
		interaction:
			| ButtonInteraction
			| AnySelectMenuInteraction
			| CommandInteraction
	) {
		const key = interaction.isCommand()
			? interaction.commandName
			: interaction.customId.split(":")[0]
		if (!key) throw new Error("No key found")
		if (
			interaction.isMessageComponent() &&
			interaction.customId.startsWith("x-")
		)
			return this.client.log(
				`Ignoring ${this.type} with key ${key}, it should be handled with a collector on a message.`,
				LogLevel.DEBUG
			)
		const component = this.fetchComponent(key) as
			| ApplicationCommand
			| Button
			| Dropdown
		if (!component)
			return this.client.log(
				`Unable to find ${this.type} with key ${key}, but it was triggered by a user.`,
				LogLevel.WARN
			)

		const sudoAs = this.client.sudo.get(interaction.user.id)
		if (sudoAs) {
			const user = await this.client.users.fetch(sudoAs)
			if (!user)
				return interaction.reply(`Unable to sudo, user ${sudoAs} not found.`)
			this.client.log(
				`${interaction.user.tag} [${interaction.user.id}] sudo'd as ${sudoAs}, running ${this.type}: ${key}`,
				LogLevel.INFO
			)
			interaction.user = user
			if (interaction.guild) {
				const member = await interaction.guild.members.fetch(sudoAs)
				if (!member)
					return interaction.reply(
						`Unable to sudo, user ${sudoAs} not in this guild and this is a guild only command.`
					)
				interaction.member = member
				interaction.memberPermissions = member.permissions
			}
		}

		this.specificChecks(interaction, component)

		const missingPermissions = await component.validate(interaction)
		if (missingPermissions)
			return interaction.reply(
				generateErrorMessage(missingPermissions, true, true)
			)

		return this.runComponent(component, interaction)
	}

	private async runComponent(
		component: _BaseComponent,
		interaction:
			| ButtonInteraction
			| AnySelectMenuInteraction
			| CommandInteraction
	) {
		if (interaction instanceof Message)
			throw new Error("Failed to initialize Text Command handler")
		this.client.usersUsingBot.add(interaction.user.id)

		if (interaction.isCommand()) {
			let optionString = ""
			for (const x of interaction.options.data) {
				if (!x.value) optionString += `${x.name} `
				else optionString += `${x.name}:${x.value} `
				for (const y of x.options ?? []) {
					optionString += `${y.name}:${y.value} `
				}
			}
			this.client.log(
				`${interaction.user.tag} [${
					interaction.user.id
				}] executed slash command: ${component.key} ${
					optionString ? `\`${optionString}\`` : ""
				}`,
				LogLevel.DEBUG
			)
		} else {
			this.client.log(
				`${interaction.user.tag} [${interaction.user.id}] used ${this.type}: ${interaction.customId}`,
				LogLevel.DEBUG
			)
		}

		await component
			.run(interaction)
			.catch(async (error: unknown): Promise<unknown> => {
				this.client.log(`${error}`, LogLevel.ERROR)
				if (error instanceof Error)
					this.client.log(`${error.stack}`, LogLevel.ERROR)
				const toSend = generateErrorMessage({
					title: "An Error Has Occurred",
					description:
						"An unexpected error was encountered while processing your request. Please try again later. If the problem persists, please contact support."
				})
				if (interaction.replied) return interaction.followUp(toSend)
				if (interaction.deferred) return interaction.editReply(toSend)
				return interaction.reply({
					...toSend
				})
			})
	}
}
