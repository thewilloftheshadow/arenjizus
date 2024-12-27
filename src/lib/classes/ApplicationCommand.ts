import {
	type ApplicationCommandOptionData,
	ApplicationCommandType,
	type AutocompleteFocusedOption,
	type AutocompleteInteraction,
	type ChatInputCommandInteraction,
	type MessageContextMenuCommandInteraction,
	type UserContextMenuCommandInteraction
} from "discord.js"
import type { ApplicationCommandOptions, BetterClient } from "../"
import BaseComponent from "./_BaseComponent"

export default class ApplicationCommand extends BaseComponent {
	/**
	 * The description of the command
	 */
	public readonly description: string
	/**
	 * The type of the command
	 * @default ApplicationCommandType.ChatInput
	 */
	public readonly type: Required<ApplicationCommandOptions["type"]> =
		ApplicationCommandType.ChatInput
	/**
	 * The options of the command
	 * @default []
	 */
	public readonly options: ApplicationCommandOptionData[] = []

	constructor(
		key: string,
		client: BetterClient,
		options: ApplicationCommandOptions
	) {
		super(key, client, options)
		this.description = options.description || ""
		this.options = options.options || []
		this.type = options.type || ApplicationCommandType.ChatInput
	}

	public override async run(
		_interaction:
			| MessageContextMenuCommandInteraction
			| UserContextMenuCommandInteraction
			| ChatInputCommandInteraction
		// biome-ignore lint/suspicious/noExplicitAny: This can truly be any
	): Promise<any> {}

	public async autocomplete(
		_interaction: AutocompleteInteraction,
		_option: AutocompleteFocusedOption
	): Promise<void> {}
}
