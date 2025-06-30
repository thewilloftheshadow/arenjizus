import { useCallback, useEffect, useState } from "react"
import { getAllWebPlayers } from "~/database/getData.js"
import { DashboardData } from "~/web/index.js"
import { Accordion } from "./Accordion.js"
import { GameConfigSection } from "./GameConfigSection.js"
import { InvestmentsSection } from "./InvestmentsSection.js"
import { PlayerTable } from "./PlayerTable.js"
import { RefreshIcon } from "./RefreshIcon.js"
import { WantedSection } from "./WantedSection.js"

export const DatabaseView = () => {
	const [players, setPlayers] = useState<
		Awaited<ReturnType<typeof getAllWebPlayers>>
	>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [dashboard, setDashboard] = useState<DashboardData | null>(null)
	const [loadingExtras, setLoadingExtras] = useState(true)
	const [errorExtras, setErrorExtras] = useState<string | null>(null)

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

	const fetchExtras = useCallback(async () => {
		try {
			setLoadingExtras(true)
			setErrorExtras(null)
			const res = await fetch("/api/dashboard")
			if (!res.ok) throw new Error("Failed to fetch dashboard data")
			const data: DashboardData = await res.json()
			setDashboard(data)
		} catch (err) {
			setErrorExtras(`${err}`)
		} finally {
			setLoadingExtras(false)
		}
	}, [])

	useEffect(() => {
		fetchPlayers()
		fetchExtras()
	}, [fetchPlayers, fetchExtras])

	const handleRefresh = () => {
		fetchPlayers()
		fetchExtras()
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

			{loadingExtras && (
				<div className="loading">Loading dashboard data...</div>
			)}
			{errorExtras && <div className="error">Error: {errorExtras}</div>}

			{!loadingExtras && !errorExtras && dashboard && (
				<>
					<WantedSection wanted={dashboard.wanted} />
					<Accordion title={`Players (${players.length})`}>
						{loading ? (
							<div className="loading">Loading players...</div>
						) : error ? (
							<div className="error">Error: {error}</div>
						) : (
							<PlayerTable players={players} />
						)}
					</Accordion>
					<Accordion title="Investments">
						<InvestmentsSection investments={dashboard.investments} />
					</Accordion>
					<Accordion title="Game Config" defaultOpen>
						<GameConfigSection config={dashboard.config} />
					</Accordion>
				</>
			)}
		</>
	)
}
