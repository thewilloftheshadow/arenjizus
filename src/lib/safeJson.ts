const cache = new WeakSet()
export const safeJSONStringify = (
	obj: unknown,
	replacer?: (key: string, value: unknown) => unknown,
	space?: string | number
) => {
	return JSON.stringify(
		obj,
		(key, value) => {
			if (typeof value === "object" && value !== null) {
				if (cache.has(value)) {
					return
				}
				cache.add(value)
			}
			if (replacer) {
				return replacer(key, value)
			}
			return value
		},
		space
	)
}
