import { AutocompleteInteraction } from "discord.js"
import BetterClient from "../extensions/BlobbyClient"

export default class AutoComplete {
    /**
     * The name of our autoComplete.
     */
    public readonly name: string

    /**
     * Our client.
     */
    public readonly client: BetterClient

    /**
     * Create our autoComplete.
     * @param name - The name of our autoComplete.
     * @param client - Our client.
     */
    constructor(name: string, client: BetterClient) {
        this.name = name

        this.client = client
    }

    /**
     * Run the autocomplete.
     * @param _interaction - The interaction that was created.
     */
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-explicit-any, no-empty-function
    public async run(_interaction: AutocompleteInteraction): Promise<void> {}
}
