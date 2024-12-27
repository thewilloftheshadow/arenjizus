import type { APIEmbed, ButtonInteraction } from "discord.js"
import { type BetterClient, type ButtonOptions, _BaseComponent } from "../"

export default class Button extends _BaseComponent {
	constructor(key: string, client: BetterClient, options?: ButtonOptions) {
		super(key, client, options || {})
	}

	public override async specificValidate(
		_interaction: ButtonInteraction
	): Promise<APIEmbed | null> {
		const sudoAs = this.client.sudo.get(_interaction.user.id)
		if (sudoAs) {
			const member = await _interaction.guild?.members.fetch(sudoAs)
			if (!member)
				return {
					title: "Missing Permissions",
					description: `Unable to sudo, user ${sudoAs} not found.`
				}
			_interaction.user = member.user
			_interaction.member = member
			_interaction.memberPermissions = member.permissions
		}
		if (
			this.authorOnly &&
			_interaction.user.id !== _interaction.message.interaction?.user.id
		) {
			return {
				title: "Missing Permissions",
				description: "This button is not for you!"
			}
		}
		return null
	}
	// biome-ignore lint/suspicious/noExplicitAny: This can truly be any
	public override async run(_interaction: ButtonInteraction): Promise<any> {}
}
