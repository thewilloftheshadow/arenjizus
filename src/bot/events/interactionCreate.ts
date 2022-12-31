import { Interaction } from "discord.js"
import EventHandler from "../../../lib/classes/EventHandler"

export default class InteractionCreate extends EventHandler {
    override async run(interaction: Interaction) {
        this.client.logger.info(
            `${interaction.type} interaction created by ${interaction.user.id}${interaction.isCommand() ? `: ${interaction.toString()}` : ""}`
        )
        if (interaction.isCommand()) {
            this.client.stats.commandsRun++
            return this.client.slashCommandHandler.handleCommand(interaction)
        }
        if (interaction.isButton()) return this.client.buttonHandler.handleButton(interaction)
        if (interaction.isSelectMenu()) return this.client.dropDownHandler.handleDropDown(interaction)
        if (interaction.isAutocomplete()) return this.client.autoCompleteHandler.handleAutoComplete(interaction)
        if (interaction.isModalSubmit()) return this.client.modalSubmitHandler.handleModal(interaction)
        const error = new Error("Invalid Interaction: Never seen this before.")
        this.client.logger.error(error)
        this.client.logger.sentry.captureWithInteraction(error, interaction)
        // @ts-ignore
        return interaction.reply(
            this.client.functions.generateErrorMessage(
                {
                    title: "Invalid Interaction",
                    description: "I've never seen this type of interaction",
                },
                true
            )
        )
    }
}
