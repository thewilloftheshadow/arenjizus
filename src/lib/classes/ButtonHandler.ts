import { type BetterClient, HandlerType } from "../"
import _BaseHandler from "./_BaseHandler"
export default class ButtonHandler extends _BaseHandler {
	constructor(client: BetterClient) {
		super(HandlerType.Button, client)
	}
}
