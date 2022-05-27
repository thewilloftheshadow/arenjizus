import { createHash } from "crypto"
import * as petitio from "petitio"
import {
    AnyChannel,
    GuildChannel,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessageEmbedOptions,
    PermissionString,
    Snowflake,
    User,
    UserResolvable,
} from "discord.js"
import { existsSync, mkdirSync, readdirSync } from "fs"
import { PetitioRequest } from "petitio"
import { Embed } from "@prisma/client"
import { permissionNames } from "./permissions"
import BetterClient from "../extensions/TuskClient"
import { GeneratedMessage, GenerateTimestampOptions } from "../../typings/index.d"

export default class Functions {
    /**
     * Our Client.
     */
    private client: BetterClient

    /**
     * Create our functions.
     * @param client - Our client.
     */
    constructor(client: BetterClient) {
        this.client = client
    }

    /**
     * Get all the files in all the subdirectories of a directory.
     * @param directory - The directory to get the files from.
     * @param fileExtension - The extension to search for.
     * @param createDirIfNotFound - Whether or not the parent directory should be created if it doesn't exist.
     * @returns The files in the directory.
     */
    public getFiles(directory: string, fileExtension: string, createDirIfNotFound = false): string[] {
        if (createDirIfNotFound && !existsSync(directory)) mkdirSync(directory)
        return readdirSync(directory).filter((file) => file.endsWith(fileExtension))
    }

    /**
     * Generate a full primary message with a simple helper function.
     * @param embedInfo - The information to build our embed with.
     * @param components - The components for our message.
     * @param ephemeral - Whether our message should be ephemeral or not.
     * @returns The generated primary message.
     */
    public generatePrimaryMessage(embedInfo: MessageEmbedOptions, components: MessageActionRow[] = [], ephemeral = false): GeneratedMessage {
        return {
            embeds: [new MessageEmbed(embedInfo).setColor(parseInt(this.client.config.colors.primary, 16))],
            components,
            ephemeral,
        }
    }

    /**
     * Generate a full success message with a simple helper function.
     * @param embedInfo - The information to build our embed with.
     * @param components - The components for our message.
     * @param ephemeral - Whether our message should be ephemeral or not.
     * @returns The generated success message.
     */
    public generateSuccessMessage(embedInfo: MessageEmbedOptions, components: MessageActionRow[] = [], ephemeral = false): GeneratedMessage {
        return {
            embeds: [new MessageEmbed(embedInfo).setColor(parseInt(this.client.config.colors.success, 16))],
            components,
            ephemeral,
        }
    }

    /**
     * Generate a full warning message with a simple helper function.
     * @param embedInfo - The information to build our embed with.
     * @param components - The components for our message.
     * @param ephemeral - Whether our message should be ephemeral or not.
     * @returns The generated warning message.
     */
    public generateWarningMessage(embedInfo: MessageEmbedOptions, components: MessageActionRow[] = [], ephemeral = false): GeneratedMessage {
        return {
            embeds: [new MessageEmbed(embedInfo).setColor(parseInt(this.client.config.colors.warning, 16))],
            components,
            ephemeral,
        }
    }

    /**
     * Generate a full error message with a simple helper function.
     * @param embedInfo - The information to build our embed with.
     * @param supportServer - Whether or not to add the support server link as a component.
     * @param components - The components for our message.
     * @param ephemeral - Whether our message should be ephemeral or not.
     * @returns The generated error message.
     */
    public generateErrorMessage(
        embedInfo: MessageEmbedOptions,
        supportServer = false,
        components: MessageActionRow[] = [],
        ephemeral = true
    ): GeneratedMessage {
        if (supportServer) {
            components.concat([
                new MessageActionRow().addComponents(
                    new MessageButton({
                        label: "Support Server",
                        url: this.client.config.supportServer,
                        style: "LINK",
                    })
                ),
            ])
        }
        return {
            embeds: [new MessageEmbed(embedInfo).setColor(parseInt(this.client.config.colors.error, 16))],
            components,
            ephemeral,
        }
    }

    /**
     * Upload content to the hastebin we use.
     * @param content - The content to upload.
     * @param type - The file type to append to the end of the haste.
     * @returns The URL to the uploaded content.
     */
    public async uploadHaste(content: string, type?: string): Promise<string | null> {
        try {
            const haste = await (
                (await petitio
                    // @ts-ignore
                    .default(`${this.client.config.hastebin}/documents`, "POST")) as PetitioRequest
            )
                .body(content)
                .header("User-Agent", `${this.client.config.botName}/${this.client.config.version}`)
                .send()
            if (haste.text() === "error code: 1020") return `Cloudflare Error 1020 - Ray ${haste.headers["cf-ray"]}`
            return `${this.client.config.hastebin}/${haste.json().key}${type ? `.${type}` : ".md"}`
        } catch (error) {
            this.client.logger.error(error)
            this.client.logger.sentry.captureWithExtras(error, {
                Hastebin: this.client.config.hastebin,
                Content: content,
            })
            return null
        }
    }

    /**
     * Generate a random string of a given length.
     * @param length - The length of the string to generate.
     * @param from - The characters to use for the string.
     * @returns The generated random ID.
     */
    public generateRandomId(length: number, from = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
        let generatedId = ""
        for (let i = 0; i < length; i++) generatedId += from[Math.floor(Math.random() * from.length)]
        return generatedId
    }

    /**
     * Get the proper name of a permission.
     * @param permission - The permission to get the name of.
     * @returns The proper name of the permission.
     */
    public getPermissionName(permission: PermissionString): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (permissionNames.has(permission)) return permissionNames.get(permission)!
        return permission
    }

    /**
     * Generate a unix timestamp for Discord to be rendered locally per user.
     * @param options - The options to use for the timestamp.
     * @returns The generated timestamp.
     */
    public generateTimestamp(options?: GenerateTimestampOptions): string {
        let timestamp = options?.timestamp || new Date()
        const type = options?.type || "f"
        if (timestamp instanceof Date) timestamp = timestamp.getTime()
        return `<t:${Math.floor(timestamp / 1000)}:${type}>`
    }

    /**
     * Parse a string to a User.
     * @param user - The user to parse.
     * @returns The parsed user.
     */
    public async parseUser(userInput: string): Promise<User | null> {
        let user = userInput
        if ((user.startsWith("<@") || user.startsWith("<@!")) && user.endsWith(">")) user = user.slice(2, -1)
        if (user.startsWith("!")) user = user.slice(1)
        try {
            return (
                this.client.users.cache.get(user)
                || this.client.users.cache.find((u) => u.tag.toLowerCase() === user?.toLowerCase())
                || (await this.client.users.fetch(user))
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.code === 50035) return null
            this.client.logger.error(error)
            this.client.logger.sentry.captureWithExtras(error, { input: user })
        }
        return null
    }

    public async parseChannel(channelInput: string): Promise<AnyChannel | null> {
        let channel = channelInput
        if (channel.startsWith("#")) channel = channel.slice(1)
        else if (channel.startsWith("<#") && channel.endsWith(">")) channel = channel.slice(2, -1)
        try {
            return (
                this.client.channels.cache.get(channel)
                || this.client.channels.cache.find((c) => (c instanceof GuildChannel ? c.name.toLowerCase() === channel.toLowerCase() : false))
                || (await this.client.channels.fetch(channel))
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            if (error.code === 50035) return null
            if (error.httpStatus === 404) return null
            this.client.logger.error(error)
            this.client.logger.sentry.captureWithExtras(error, {
                input: channel,
            })
        }
        return null
    }

    /**
     * Turn a string into Title Case.
     * @param string - The string to convert.
     * @returns The converted string.
     */
    public titleCase(string: string): string {
        return string
            .replace(/[-_]/g, " ")
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }

    /**
     * Hash a string into SHA256.
     * @param string - The string to hash.
     * @returns The hashed string.
     */
    public hash(string: string): string {
        return createHash("sha256").update(string).digest("hex")
    }

    /**
     * Choose an item out of a list of items.
     * @param choices - The list of items to choose from.
     * @returns The chosen item.
     */
    public random(choices: unknown[]): unknown {
        return choices[Math.floor(Math.random() * choices.length)]
    }

    /**
     * Get whether a user is an admin or not.
     * @param snowflake - The user ID to check.
     * @returns Whether the user is an admin or not.
     */
    public isAdmin(snowflake: Snowflake) {
        return this.client.config.admins.includes(snowflake)
    }

    /**
     * Verify if an object is a promise.
     * @param input - The object to verify.
     * @returns Whether the object is a promise or not.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public isThenable(input: any): boolean {
        if (!input) return false
        return input instanceof Promise || (input !== Promise.prototype && this.isFunction(input.then) && this.isFunction(input.catch))
    }

    /**
     * Verify if the input is a function.
     * @param input - The input to verify.
     * @returns Whether the input is a function or not.
     */
    public isFunction(input: unknown): boolean {
        return typeof input === "function"
    }

    /**
     * Get a user from the database
     * @param user - The user to check.
     * @returns The prisma db user.
     */
    public getUserDatabase(user: UserResolvable) {
        const id = this.client.users.resolveId(user)
        if (!id) return null
        return this.client.prisma.user.findFirst({ where: { id } })
    }

    public buildEmbedFromDb(embedData: Embed) {
        const embed = new MessageEmbed()
        if (embedData.title) embed.setTitle(embedData.title)
        if (embedData.description) embed.setDescription(embedData.description)
        if (embedData.color) embed.setColor(embedData.color)
        if (embedData.footer) embed.setFooter({ text: embedData.footer })
        if (embedData.image) embed.setImage(embedData.image)
        if (embedData.thumbnail) embed.setThumbnail(embedData.thumbnail)

        return embed
    }

    public emojiList(items: string[], doFirst?: boolean) {
        if (!items || items.length === 0) throw new Error("No items were specified")
        const emoji = (i: number) => {
            if (i === 0) return doFirst ? "<:replystart:893484406034018325>" : ""
            if (i === items.length - 1) return "<:reply:878129517162549251>"
            return "<:replycont:878129530668216331>"
        }
        return items.map((x, i) => `${emoji(i)} ${x}`).join("\n")
    }

    public parseRedeemItems(items: string[], formatted = true): string[] | { name: string; amount: number }[] {
        const itemInfo: { name: string; amount: number }[] = []
        items.forEach((x) => {
            const [name, amount] = x.split("-")
            if (!name || !amount) return
            itemInfo.push({
                name: name.trim(),
                amount: parseInt(amount.trim(), 10),
            })
        })
        if (formatted) {
            return itemInfo.map((x) => `${x.amount}x ${x.name}`) || "No items specified"
        }
        return itemInfo || {}
    }

    public getEmojiUrl(emojiString: string): string {
        const animated = emojiString.split(":")[0] === "<a"
        const id = emojiString.split(":")[2]?.replace(">", "")
        return `https://cdn.discordapp.com/emojis/${id}.${animated ? "gif" : "png"}`
    }
}
