/* eslint-disable prefer-const */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const shuffle = (arr: any[], options?: { copy?: boolean; rng?: () => number }) => {
	if (!Array.isArray(arr)) {
		throw new Error("shuffle expect an array as parameter.")
	}

	options = options || {}

	let collection = arr,
		len = arr.length,
		rng = options.rng || Math.random,
		random,
		temp

	if (options.copy === true) {
		collection = arr.slice()
	}

	while (len) {
		random = Math.floor(rng() * len)
		len -= 1
		temp = collection[len]
		collection[len] = collection[random]
		collection[random] = temp
	}

	return collection
}
