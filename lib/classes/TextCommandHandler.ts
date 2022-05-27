import { Message, Snowflake } from "discord.js"
import TextCommand from "./TextCommand"
import BetterClient from "../extensions/TuskClient"

export default class TextCommandHandler {
    /**
     * Our client.
     */
    private readonly client: BetterClient

    /**
     * How long a user must wait between each text command.
     */
    private readonly coolDownTime: number

    /**
     * Our user's cooldowns.
     */
    private coolDowns: Set<Snowflake>

    /**
     * Create our TextCommandHandler.
     * @param client - The client we are using.
     */
    constructor(client: BetterClient) {
        this.client = client

        this.coolDownTime = 1000
        this.coolDowns = new Set()
    }

    /**
     * Load all of the text commands in the textCommands directory.
     */
    public loadTextCommands() {
        this.client.functions.getFiles(`${this.client.__dirname}/dist/src/bot/textCommands`, "", true).forEach((parentFolder) =>
            this.client.functions.getFiles(`${this.client.__dirname}/dist/src/bot/textCommands/${parentFolder}`, ".js").forEach(async (fileName) => {
                try {
                    const commandFile = await import(`../../src/bot/textCommands/${parentFolder}/${fileName}`)
                    // eslint-disable-next-line new-cap
                    const command: TextCommand = new commandFile.default(this.client)
                    return this.client.textCommands.set(command.name, command)
                } catch (error) {
                    this.client.logger.error(`Error loading text command ${fileName}: ${error}`)
                }
                return null
            }))
    }

    /**
     * Reload all the text commands in the textCommands directory.
     */
    public reloadTextCommands() {
        this.client.textCommands.clear()
        this.loadTextCommands()
    }

    /**
     * Fetch the text command that has the provided name.
     * @param name - The name to search for.
     */
    private fetchCommand(name: string): TextCommand | undefined {
        return this.client.textCommands.get(name)
    }

    public async handleCommand(message: Message) {
        const prefix = this.client.config.prefixes.find((p) => message.content.startsWith(p))
        if (!prefix) return
        const args = message.content.slice(prefix.length).trim().split(/ +/g)
        const commandName = args.shift()?.toLowerCase()
        const command = this.fetchCommand(commandName || "")
        if (!command) return

        const missingPermissions = await command.validate(message)
        if (missingPermissions) return message.reply(this.client.functions.generateErrorMessage(missingPermissions))

        const preChecked = await command.preCheck(message)
        if (!preChecked[0]) {
            if (preChecked[1]) await message.reply(this.client.functions.generateErrorMessage(preChecked[1]))
            return
        }

        return this.runCommand(command, message, args)
    }

    /**
     * Execute our text command.
     * @param command - The text command we want to execute.
     * @param message - The message that was created for our text command.
     * @param args - The arguments for our text command.
     */
    // @ts-ignore
    private async runCommand(command: TextCommand, message: Message, args: string[]) {
        if (this.coolDowns.has(message.author.id)) {
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "Command Cooldown",
                    description: "Please wait a second before running this command again!",
                })
            )
        }

        this.client.usersUsingBot.add(message.author.id)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        command.run(message, args).catch(async (error): Promise<any> => {
            this.client.logger.error(error)
            const sentryId = await this.client.logger.sentry.captureWithMessage(error, message)
            return message.reply(
                this.client.functions.generateErrorMessage({
                    title: "An Error Has Occurred",
                    description: `An unexpected error was encountered while running \`${command.name}\`, my developers have already been notified! Feel free to join my support server in the mean time!`,
                    footer: { text: `Sentry Event ID: ${sentryId} ` },
                })
            )
        })
        this.coolDowns.add(message.author.id)
        setTimeout(() => this.coolDowns.delete(message.author.id), this.coolDownTime)
    }
}
