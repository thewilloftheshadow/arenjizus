import { ButtonInteraction } from "discord.js"
import Button from "../../../../lib/classes/Button"
import TuskClient from "../../../../lib/extensions/TuskClient"

export default class CancelGiveaway extends Button {
    constructor(client: TuskClient) {
        super("cancelGwa", client)
    }

    override async run(interaction: ButtonInteraction) {
        const [userId, giveawayId] = interaction.customId.split(":")[1].split(",")
        if (userId !== interaction.user.id) {
            return interaction.reply(
                this.client.functions.generateErrorMessage({
                    title: "Invalid User",
                    description: "You did not create this giveaway, so you cannot cancel it.",
                })
            )
        }

        this.client.giveawayManager.cancelGiveaway(giveawayId)
        interaction.reply(
            this.client.functions.generateSuccessMessage({ title: "Success", description: "The giveaway has been canceled!" }, [], true)
        )
        interaction.channel?.messages.resolve(interaction.message.id)?.edit({ embeds: [], components: [], content: "Giveaway canceled." })
    }
}
