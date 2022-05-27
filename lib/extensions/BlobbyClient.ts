import { resolve } from "path"
import { PrismaClient } from "@prisma/client"
import { Client, ClientOptions, Collection } from "discord.js"
import Button from "../classes/Button"
import DropDown from "../classes/DropDown"
import * as Logger from "../classes/Logger"
import Config from "../../config/bot.config"
import Functions from "../utilities/functions"
import { CachedStats, Stats } from "../../typings"
import TextCommand from "../classes/TextCommand"
import EventHandler from "../classes/EventHandler"
import SlashCommand from "../classes/SlashCommand"
import ButtonHandler from "../classes/ButtonHandler"
import DropDownHandler from "../classes/DropDownHandler"
import TextCommandHandler from "../classes/TextCommandHandler"
import SlashCommandHandler from "../classes/SlashCommandHandler"
import AutoCompleteHandler from "../classes/AutoCompleteHandler"
import AutoComplete from "../classes/AutoComplete"
import ModalSubmitHandler from "../classes/ModalSubmitHandler"
import ModalSubmit from "../classes/ModalSubmit"

export default class TuskClient extends Client {
    public usersUsingBot: Set<string>
    public readonly config
    public readonly functions: Functions
    public readonly logger: Logger.Logger
    public readonly slashCommandHandler: SlashCommandHandler
    public slashCommands: Collection<string, SlashCommand>
    public readonly textCommandHandler: TextCommandHandler
    public textCommands: Collection<string, TextCommand>
    public readonly buttonHandler: ButtonHandler
    public buttons: Collection<string, Button>
    public readonly dropDownHandler: DropDownHandler
    public dropDowns: Collection<string, DropDown>
    public readonly autoCompleteHandler: AutoCompleteHandler
    public autoCompletes: Collection<string, AutoComplete>
    public readonly modalSubmitHandler: ModalSubmitHandler
    public modals: Collection<string, ModalSubmit>
    public events: Map<string, EventHandler>
    public readonly prisma: PrismaClient
    public readonly version: string
    public stats: Stats
    public cachedStats: CachedStats
    public hasteStore: string[] = []

    /**
     * __dirname is not in our version of ECMA, so we make do with a shitty fix.
     */
    public readonly __dirname: string

    /**
     * Create our client.
     * @param options - The options for our client.
     */
    constructor(options: ClientOptions) {
        super(options)

        this.__dirname = resolve()

        this.usersUsingBot = new Set()
        this.config = Config
        this.functions = new Functions(this)
        this.logger = Logger.default

        this.slashCommandHandler = new SlashCommandHandler(this)
        this.slashCommands = new Collection()

        this.textCommandHandler = new TextCommandHandler(this)
        this.textCommands = new Collection()

        this.buttonHandler = new ButtonHandler(this)
        this.buttons = new Collection()

        this.dropDownHandler = new DropDownHandler(this)
        this.dropDowns = new Collection()

        this.autoCompleteHandler = new AutoCompleteHandler(this)
        this.autoCompletes = new Collection()

        this.modalSubmitHandler = new ModalSubmitHandler(this)
        this.modals = new Collection()

        this.events = new Map()

        this.prisma = new PrismaClient({ log: ["query", "info", "warn"] })

        this.version = process.env.NODE_ENV === "development" ? `${this.config.version}-dev` : this.config.version

        this.stats = {
            messageCount: 0,
            commandsRun: 0,
        }

        this.cachedStats = {
            guilds: 0,
            users: 0,
            cachedUsers: 0,
            channels: 0,
            roles: 0,
        }

        this.dropDownHandler.loadDropDowns()
        this.buttonHandler.loadButtons()
        this.slashCommandHandler.loadSlashCommands()
        this.textCommandHandler.loadTextCommands()
        this.autoCompleteHandler.loadAutoCompletes()
        this.modalSubmitHandler.loadModals()
        this.loadEvents()
    }

    /**
     * Login to Discord.
     */
    override async login() {
        return super.login()
    }

    /**
     * Load all the events in the events directory.
     */
    private loadEvents() {
        return this.functions.getFiles(`${this.__dirname}/dist/src/bot/events`, ".js", true).forEach(async (eventFileName) => {
            const eventFile = await import(`./../../src/bot/events/${eventFileName}`)
            // eslint-disable-next-line new-cap
            const event: EventHandler = new eventFile.default(this, eventFileName.split(".js")[0])
            event.listen()
            return this.events.set(event.name, event)
        })
    }

    /**
     * Reload all the events in the events directory.
     */
    public reloadEvents() {
        this.events.forEach((event) => event.removeListener())
        this.loadEvents()
    }

    /**
     * Fetch all the stats for our client.
     */
    public async fetchStats() {
        const stats = await this.shard?.broadcastEval((client) => ({
            guilds: client.guilds.cache.size,
            users: client.guilds.cache.reduce((previous, guild) => previous + (guild.memberCount ?? 0), 0),
            cachedUsers: client.users.cache.size,
            channels: client.channels.cache.size,
            roles: client.guilds.cache.reduce((previous, guild) => previous + guild.roles.cache.size, 0),
        }))

        const reducedStats = stats?.reduce((previous, current) => {
            Object.keys(current).forEach(
                // @ts-ignore
                // eslint-disable-next-line no-return-assign, no-param-reassign
                (key) => (previous[key] += current[key])
            )
            return previous
        })
        this.cachedStats = reducedStats || this.cachedStats
        return reducedStats || this.cachedStats
    }

    public hasteLog(text: string) {
        this.hasteStore.push(text)
    }

    public async hasteFlush() {
        const final = this.hasteStore.join("\n")
        const url = await this.functions.uploadHaste(final, "js")
        return url
    }
}
