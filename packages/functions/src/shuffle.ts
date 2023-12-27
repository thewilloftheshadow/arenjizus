export const shuffle = (
	// biome-ignore lint/suspicious/noExplicitAny: this can be any
	arr: any[],
	options: { copy?: boolean; rng?: () => number } = {}
) => {
	if (!Array.isArray(arr)) {
		throw new Error("shuffle expect an array as parameter.")
	}

	let collection = arr
	let len = arr.length
	const rng = options.rng || Math.random
	let random
	let temp

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
