import { type BetterClient, HandlerType } from "../"

import _BaseHandler from "./_BaseHandler"

export default class DropdownHandler extends _BaseHandler {
	constructor(client: BetterClient) {
		super(HandlerType.Dropdown, client)
	}
}
