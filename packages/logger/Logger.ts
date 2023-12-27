import { WebhookClient } from "discord.js"
import {
	Logger as WinstonLogger,
	createLogger,
	format,
	transports
} from "winston"
import { DebugType } from "./index.js"

export default class Logger {
	private winston: WinstonLogger
	private gameLogClient: WebhookClient | null

	constructor() {
		this.winston = createLogger({
			transports: [
				new transports.Console({
					format: format.combine(
						format.timestamp(),
						format.colorize(),
						format.simple(),
						format.errors({ stack: true })
					),
					handleExceptions: true,
					handleRejections: true,
					level: "silly"
				})
			]
		})
		this.gameLogClient = process.env.GAME_HOOK
			? new WebhookClient({ url: process.env.GAME_HOOK })
			: null
	}

	// biome-ignore lint/suspicious/noExplicitAny: True any
	public log(message: string, properties?: { [key: string]: any }): void {
		this.winston.log(message, properties)
	}

	public debug(
		// biome-ignore lint/suspicious/noExplicitAny: True any
		message: any,
		type: DebugType = DebugType.GENERAL,
		// biome-ignore lint/suspicious/noExplicitAny: True any
		properties?: { [key: string]: any }
	): void {
		// biome-ignore lint/style/noParameterAssign: Cleaner
		if (typeof message === "object") message = JSON.stringify(message, null, 2)
		this.winston.debug(message, { type, ...properties })
	}

	// biome-ignore lint/suspicious/noExplicitAny: True any
	public warn(message: string, properties: { [key: string]: any } = {}): void {
		this.winston.warn(message, properties)
	}

	// biome-ignore lint/suspicious/noExplicitAny: True any
	public info(message: string, properties?: { [key: string]: any }): void {
		this.winston.info(message, properties)
	}

	// biome-ignore lint/suspicious/noExplicitAny: True any
	public error(message: string, properties: { [key: string]: any } = {}): void {
		this.winston.error(message)
		this.null(properties)
	}

	public thrownError(
		error: Error,
		// biome-ignore lint/suspicious/noExplicitAny: True any
		properties: { [key: string]: any } = {}
	): void {
		// console.error(error)
		this.winston.error(`${error.message} ${error.stack}`)
		this.null(properties)
	}

	public null(..._args: unknown[]): null {
		return null
	}

	public gameLog(message: string): void {
		if (!this.gameLogClient) return
		this.gameLogClient.send(message)
	}
}
