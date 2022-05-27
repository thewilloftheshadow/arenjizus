/* eslint-disable import/order */
import ModalSubmit from "./ModalSubmit"
import BetterClient from "../extensions/TuskClient"
import { ModalSubmitInteraction } from "discord.js"

export default class ModalSubmitHandler {
    /**
     * Our client.
     */
    private readonly client: BetterClient

    /**
     * Create our ModalSumbitHandler.
     * @param client - Our client.
     */
    constructor(client: BetterClient) {
        this.client = client
    }

    /**
     * Load all the buttons in the modals directory.
     */
    public loadModals() {
        this.client.functions.getFiles(`${this.client.__dirname}/dist/src/bot/modalSubmits`, "", true).forEach((parentFolder) =>
            this.client.functions.getFiles(`${this.client.__dirname}/dist/src/bot/modalSubmits/${parentFolder}`, ".js").forEach(async (fileName) => {
                const modalFile = await import(`${this.client.__dirname}/dist/src/bot/modalSubmits/${parentFolder}/${fileName}`)
                // eslint-disable-next-line new-cap
                const modal: ModalSubmit = new modalFile.default(this.client)
                return this.client.modals.set(modal.name, modal)
            }))
    }

    /**
     * Reload all the buttons in the modals directory.
     */
    public reloadButtons() {
        this.client.modals.clear()
        this.loadModals()
    }

    /**
     * Fetch the button that starts with the provided customId.
     * @param customId - The customId to search for.
     * @returns The button we've found.
     */
    private fetchModal(customId: string): ModalSubmit | undefined {
        return this.client.modals.find((modal) => customId.startsWith(modal.name))
    }

    /**
     * Handle the interaction created for this button to make sure the user and client can execute it.
     * @param interaction - The interaction created.
     */
    public async handleModal(interaction: ModalSubmitInteraction) {
        const modal = this.fetchModal(interaction.customId)
        this.client.logger.debug(interaction.customId, modal, this.client.modals)
        if (!modal) return

        const preChecked = await modal.preCheck(interaction)
        if (!preChecked[0]) {
            if (preChecked[1]) await interaction.reply(this.client.functions.generateErrorMessage(preChecked[1]))
            return
        }

        return this.runModal(modal, interaction)
    }

    /**
     * Execute our modal.
     * @param modal - The modal we want to execute.
     * @param interaction - The interaction for our modal.
     */
    private async runModal(modal: ModalSubmit, interaction: ModalSubmitInteraction) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        modal.run(interaction).catch(async (error: any): Promise<any> => {
            this.client.logger.error(error)
            const sentryId = await this.client.logger.sentry.captureWithInteraction(error, interaction)
            const toSend = this.client.functions.generateErrorMessage(
                {
                    title: "An Error Has Occurred",
                    description: `An unexpected error was encountered while submitting, my developers have already been notified! Feel free to join my support server in the mean time!`,
                    footer: { text: `Sentry Event ID: ${sentryId} ` },
                },
                true
            )
            if (interaction.replied) return interaction.followUp(toSend)
            return interaction.reply({
                ...toSend,
            })
        })
    }
}
