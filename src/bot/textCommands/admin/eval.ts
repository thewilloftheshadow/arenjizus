import { Message, MessageEmbed } from "discord.js"
import { inspect } from "util"
import StopWatch from "../../../../lib/classes/StopWatch"
import TextCommand from "../../../../lib/classes/TextCommand"
import Type from "../../../../lib/classes/Type"
import BetterClient from "../../../../lib/extensions/TuskClient"

export default class Eval extends TextCommand {
    constructor(client: BetterClient) {
        super("eval", client, {
            description: "Evaluates arbitrary JavaScript code.",
            devOnly: true,
        })
    }

    override async run(message: Message, args: string[]) {
        this.client.logger.info(`${message.author.tag} ran eval in ${message.guild?.name} ${message.guild?.id}, ${args.join(" ")}`)

        const {
            success, result, time, type,
        } = await this.eval(message, args.join(" "))
        if (message.content.includes("--silent")) return null

        if (result.length > 4087) {
            return message.reply({
                embeds: [
                    new MessageEmbed({
                        title: success ? "🆗 Evaluated successfully." : "🆘 JavaScript failed.",
                        description: `Output too long for Discord, view it [here](${await this.client.functions.uploadHaste(result, "ts")})`,
                        fields: [
                            {
                                name: "Type",
                                value: `\`\`\`ts\n${type}\`\`\`\n${time}`,
                            },
                        ],
                        color: parseInt(success ? this.client.config.colors.success : this.client.config.colors.error, 16),
                    }),
                ],
            })
        }

        return message.reply({
            embeds: [
                new MessageEmbed({
                    title: success ? "🆗 Evaluated successfully." : "🆘 JavaScript failed.",
                    description: `\`\`\`js\n${result}\`\`\``,
                    fields: [
                        {
                            name: "Type",
                            value: `\`\`\`ts\n${type}\`\`\`\n${time}`,
                        },
                    ],
                    color: parseInt(success ? this.client.config.colors.success : this.client.config.colors.error, 16),
                }),
            ],
        })
    }

    private async eval(message: Message, codeInput: string) {
        let code = codeInput.replace(/[“”]/g, "\"").replace(/[‘’]/g, "'")
        const stopwatch = new StopWatch()
        let success
        let syncTime
        let asyncTime
        let result
        let thenable = false
        let type
        try {
            if (message.content.includes("--async")) code = `(async () => {\n${code}\n})();`
            // eslint-disable-next-line no-eval
            result = eval(code)
            syncTime = stopwatch.toString()
            type = new Type(result)
            if (this.client.functions.isThenable(result)) {
                thenable = true
                stopwatch.restart()
                result = await result
                asyncTime = stopwatch.toString()
                type.addValue(result)
            }
            success = true
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (!syncTime) syncTime = stopwatch.toString()
            if (!type) type = new Type(error)
            if (thenable && !asyncTime) asyncTime = stopwatch.toString()
            if (error && error.stack) this.client.emit("error", error.stack)
            result = error
            success = false
        }

        stopwatch.stop()
        return {
            success,
            type,
            time: this.formatTime(syncTime, asyncTime),
            result: this.parseContent(inspect(result)),
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

    private formatTime(syncTime: string, asyncTime?: string) {
        return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`
    }
}
