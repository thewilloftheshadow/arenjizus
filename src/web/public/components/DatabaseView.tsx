import { useCallback, useEffect, useState } from "react"
import { getAllWebPlayers } from "~/database/getData.js"
import { DashboardData } from "~/web/index.js"
import { Accordion } from "./Accordion.js"
import { GameConfigSection } from "./GameConfigSection.js"
import { InvestmentsSection } from "./InvestmentsSection.js"
import { ItemsSection } from "./ItemsSection.js"
import { PlayerTable } from "./PlayerTable.js"
import { RefreshIcon } from "./RefreshIcon.js"
import { RolesSection } from "./RolesSection.js"
import { VotesSection } from "./VotesSection.js"
import { WantedSection } from "./WantedSection.js"

const ACCORDION_STORAGE_KEY = "dbview_accordion_open_sections"

export const DatabaseView = () => {
	const [players, setPlayers] = useState<
		Awaited<ReturnType<typeof getAllWebPlayers>>
	>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [dashboard, setDashboard] = useState<DashboardData | null>(null)
	const [loadingExtras, setLoadingExtras] = useState(true)
	const [errorExtras, setErrorExtras] = useState<string | null>(null)

	const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
	const [secondsAgo, setSecondsAgo] = useState<number>(0)

	const sectionKeys = [
		"Votes",
		"Players",
		"Investments",
		"Items",
		"Roles",
		"Game Config"
	]

	const [openSections, setOpenSections] = useState<Record<string, boolean>>(
		() => {
			if (typeof window !== "undefined") {
				try {
					const raw = localStorage.getItem(ACCORDION_STORAGE_KEY)
					if (raw) return JSON.parse(raw)
				} catch {}
			}
			// Default: only Game Config open
			return { "Game Config": true }
		}
	)

	const setSectionOpen = (key: string, open: boolean) => {
		setOpenSections((prev) => {
			const next = { ...prev, [key]: open }
			localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(next))
			return next
		})
	}

	const handleCloseAll = () => {
		const closed: Record<string, boolean> = {}
		for (const k of sectionKeys) closed[k] = false
		setOpenSections(closed)
		localStorage.setItem(ACCORDION_STORAGE_KEY, JSON.stringify(closed))
	}

	function formatAgo(seconds: number) {
		const h = Math.floor(seconds / 3600)
		const m = Math.floor((seconds % 3600) / 60)
		const s = seconds % 60
		const parts = []
		if (h > 0) parts.push(`${h} hour${h === 1 ? "" : "s"}`)
		if (m > 0) parts.push(`${m} minute${m === 1 ? "" : "s"}`)
		if (s > 0 || parts.length === 0)
			parts.push(`${s} second${s === 1 ? "" : "s"}`)
		return parts.join(" ")
	}

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
		setLastUpdated(new Date())
	}, [fetchPlayers, fetchExtras])

	const handleRefresh = () => {
		fetchPlayers()
		fetchExtras()
		setLastUpdated(new Date())
	}

	useEffect(() => {
		if (!lastUpdated) return
		const interval = setInterval(() => {
			setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000))
		}, 1000)
		return () => clearInterval(interval)
	}, [lastUpdated])

	return (
		<>
			<div
				className="header"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					marginBottom: 24
				}}
			>
				<h1 className="title" style={{ margin: 0 }}>
					Database Live View
				</h1>
				<div
					style={{ display: "flex", alignItems: "center", gap: 12, height: 40 }}
				>
					{lastUpdated && (
						<span
							style={{
								fontSize: 14,
								color: "#888",
								display: "flex",
								alignItems: "center",
								height: "100%"
							}}
						>
							Last updated {formatAgo(secondsAgo)} ago
						</span>
					)}
					<button
						type="button"
						className="refresh-button"
						onClick={handleRefresh}
					>
						<RefreshIcon />
						Refresh
					</button>
					<button
						type="button"
						className="refresh-button"
						onClick={handleCloseAll}
					>
						Close All
					</button>
				</div>
			</div>

			{loadingExtras && (
				<div className="loading">Loading dashboard data...</div>
			)}
			{errorExtras && <div className="error">Error: {errorExtras}</div>}

			{!loadingExtras && !errorExtras && dashboard && (
				<>
					<WantedSection wanted={dashboard.wanted} />
					{(() => {
						const voteTotals: Record<string, number> = {}
						for (const v of dashboard.votes) {
							if (v.votedFor) {
								voteTotals[v.votedFor] =
									(voteTotals[v.votedFor] || 0) + v.voteWorth
							}
						}
						const entries = Object.entries(voteTotals)
						const top =
							entries.length > 0
								? entries.reduce((a, b) => (a[1] > b[1] ? a : b))
								: null
						const title = top
							? `Votes (${top[0]}: ${top[1]} vote${top[1] === 1 ? "" : "s"})`
							: "Votes"
						return (
							<Accordion
								title={title}
								open={!!openSections.Votes}
								onToggle={(open) => setSectionOpen("Votes", open)}
							>
								<VotesSection
									votes={dashboard.votes.filter((v) => v.votedFor !== null)}
								/>
							</Accordion>
						)
					})()}
					<Accordion
						title={`Players (${players.length})`}
						open={!!openSections.Players}
						onToggle={(open) => setSectionOpen("Players", open)}
					>
						{loading ? (
							<div className="loading">Loading players...</div>
						) : error ? (
							<div className="error">Error: {error}</div>
						) : (
							<PlayerTable players={players} />
						)}
					</Accordion>
					<Accordion
						title="Investments"
						open={!!openSections.Investments}
						onToggle={(open) => setSectionOpen("Investments", open)}
					>
						<InvestmentsSection investments={dashboard.investments} />
					</Accordion>
					<Accordion
						title={`Items (${dashboard.items.length})`}
						open={!!openSections.Items}
						onToggle={(open) => setSectionOpen("Items", open)}
					>
						<ItemsSection items={dashboard.items} />
					</Accordion>
					<Accordion
						title={`Roles (${dashboard.roles.length})`}
						open={!!openSections.Roles}
						onToggle={(open) => setSectionOpen("Roles", open)}
					>
						<RolesSection roles={dashboard.roles} />
					</Accordion>
					<Accordion
						title="Game Config"
						open={!!openSections["Game Config"]}
						onToggle={(open) => setSectionOpen("Game Config", open)}
					>
						<GameConfigSection config={dashboard.config} />
					</Accordion>
				</>
			)}
		</>
	)
}
