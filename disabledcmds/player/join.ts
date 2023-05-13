// import { serverIds } from "@internal/config"
// import { TextCommand, BetterClient } from "@internal/lib"
// import { Message } from "discord.js"

// export default class Cmd extends TextCommand {
// 	constructor(client: BetterClient) {
// 		super("hippotime", client, {})
// 	}

// 	override async run(message: Message) {
// 		if (message.channelId !== "1105754920063352852") return message.reply("LMAO get a load of this nerd")
// 		await message.delete()
// 		message.member?.roles.add(serverIds.roles.player)
// 	}
// }
