import { admins } from "@internal/config"
import type { Snowflake } from "discord.js"

/**
 * Get whether a user is an admin or not.
 * @param snowflake - The user ID to check.
 * @returns Whether the user is an admin or not.
 */
export const isAdmin = (snowflake: Snowflake): boolean => {
	return admins.includes(snowflake)
}
