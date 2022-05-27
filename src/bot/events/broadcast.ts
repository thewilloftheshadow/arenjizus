import { BroadcastData, BroadcastType } from "../../../lib/classes/BroadcastManager"
import EventHandler from "../../../lib/classes/EventHandler"

export default class Broadcast extends EventHandler {
    override async run(type: BroadcastType, data: BroadcastData, guildFilter?: string[]) {
        this.client.broadcastManager.broadcast(type, data, guildFilter)
        this.client.logger.debug(`Broadcast signal received, type: ${type}`)
    }
}
