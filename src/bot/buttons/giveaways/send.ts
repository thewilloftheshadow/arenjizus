import { ButtonInteraction } from "discord.js"
import Button from "../../../../lib/classes/Button"
import TuskClient from "../../../../lib/extensions/TuskClient"

export default class SendGiveaway extends Button {
    constructor(client: TuskClient) {
        super("sendGwa", client)
    }

    override async run(interaction: ButtonInteraction) {
        const [userId, giveawayId] = interaction.customId.split(":")[1].split(",")
        if (userId !== interaction.user.id) {
            return interaction.reply(
                this.client.functions.generateErrorMessage({
                    title: "Invalid User",
                    description: "You did not create this giveaway, so you cannot send it.",
                })
            )
        }

        this.client.giveawayManager.sendGiveaway(giveawayId)
        interaction.reply(this.client.functions.generateSuccessMessage({ title: "Success", description: "The giveaway has been queued to be sent!" }))
    }
}
