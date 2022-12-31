import { MessageEmbedOptions, ModalSubmitInteraction } from "discord.js"
import BetterClient from "../extensions/BlobbyClient"

export default class ModalSubmit {
    /**
     * The beginning of the customId this modal listens for.
     */
    public readonly name: string

    /**
     * Our client.
     */
    public readonly client: BetterClient

    /**
     * Create our Button.
     * @param name - The beginning of the customId this modal submit listens for.
     * @param client - Our client.
     * @param options - The options for our button.
     */
    constructor(name: string, client: BetterClient) {
        this.name = name
        this.client = client
    }

    /**
     * This function must be evaluated to true or else this modal submit will not be executed.
     * @param _interaction - The interaction that was created.
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any, no-empty-function
    public async preCheck(_interaction: ModalSubmitInteraction): Promise<[boolean, MessageEmbedOptions?]> {
        return [true]
    }

    /**
     * Run this button.
     * @param _interaction - The interaction that was created.
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any, no-empty-function
    public async run(_interaction: ModalSubmitInteraction): Promise<any> {}
}
