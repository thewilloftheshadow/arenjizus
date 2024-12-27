import type { APIEmbed, Message } from "discord.js"
import type { BetterClient, TextCommandOptions } from "../"
import { titleCase } from "~/functions/titleCase"
import { checkAccess } from "@buape/functions"

export default class TextCommand {
	public readonly client: BetterClient
	public readonly key: string
	public readonly restriction?: string

	constructor(key: string, client: BetterClient, options: TextCommandOptions) {
		this.key = key
		this.client = client
		this.restriction = options.restriction
	}

	public async validate(_message: Message): Promise<APIEmbed | null> {
		if (
			this.restriction &&
			!(await checkAccess(
				_message.author.id,
				this.restriction,
				this.client.config.accessSettings,
				this.client
			))
		) {
			return {
				title: "Missing Permissions",
				description: `This command can only be used by ${this.client.user?.username || "the bot"
					} ${titleCase(this.restriction)}s.`
			}
		}

		return null
	}
	// biome-ignore lint/suspicious/noExplicitAny: This can truly be any
	public async run(_message: Message, _args: string[]): Promise<any> { }
}
