import { useCallback, useEffect, useState } from "react"
import { getAllWebPlayers } from "~/database/getData.js"
import { PlayerTable } from "./PlayerTable.js"
import { RefreshIcon } from "./RefreshIcon.js"

export const DatabaseView = () => {
	const [players, setPlayers] = useState<
		Awaited<ReturnType<typeof getAllWebPlayers>>
	>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const fetchPlayers = useCallback(async () => {
		try {
			setLoading(true)
			setError(null)
			const response = await fetch("/api/players")
			if (!response.ok) {
				throw new Error("Failed to fetch players")
			}
			const data = await response.json()
			setPlayers(data)
		} catch (err) {
			setError(`${err}`)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchPlayers()
	}, [fetchPlayers])

	const handleRefresh = () => {
		fetchPlayers()
	}

	return (
		<>
			<div className="header">
				<h1 className="title">Database Live View</h1>
			</div>

			<button type="button" className="refresh-button" onClick={handleRefresh}>
				<RefreshIcon />
				Refresh
			</button>

			{loading && <div className="loading">Loading players...</div>}
			{error && <div className="error">Error: {error}</div>}
			{!loading && !error && <PlayerTable players={players} />}
		</>
	)
}
