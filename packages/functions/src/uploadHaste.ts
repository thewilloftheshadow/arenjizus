/**
 * Upload content to the hastebin we use.
 * @param content - The content to upload.
 * @param type - The file type to append to the end of the haste.
 * @param url - A non-standard url to upload to
 * @returns The URL to the uploaded content.
 */
export const uploadHaste = async (
	content: string,
	type = "md",
	url = "https://haste.jtjs.org"
): Promise<string | null> => {
	const postUrl = `${url}/documents`
	const options: RequestInit = {
		method: "POST",
		body: content,
		headers: {
			"User-Agent": `Shadow/Arenjizus`
		}
	}
	const res = await fetch(postUrl, options)

	if (!res.ok) {
		throw new Error(`Failed to upload haste`)
		return null
	}
	const data: any = await res.json()
	return `${url}/${data.key}.${type || "md"}`
}
