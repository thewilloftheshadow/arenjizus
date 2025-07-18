import type { PermissionsString } from "discord.js"
import { permissionNames } from "./permissions.js"

/**
 * Get the proper name of a permission.
 * @param permission - The permission to get the name of.
 * @returns The proper name of the permission.
 */
export const getPermissionName = (permission: PermissionsString): string => {
	if (permissionNames.has(permission)) return permissionNames.get(permission)!
	return permission
}
