import { useEffect, useRef, useState } from "react"
import { getAllWebPlayers } from "~/database/getData"
import type { ItemWithPlayers, RoleWithPlayers } from "~/lib/typings/database"
import Modal from "./Modal"

type Player = Awaited<ReturnType<typeof getAllWebPlayers>>[number]
type ModalRole = RoleWithPlayers & {
	linkedAbilities?: { abilityName: string }[]
}
type ModalItem = ItemWithPlayers & {
	linkedAbilities?: { abilityName: string }[]
}
type ModalData =
	| { type: "role"; data: ModalRole }
	| { type: "item"; data: ModalItem }
	| null

export const PlayerTable = ({ players }: { players: Player[] }) => {
	const [modalOpen, setModalOpen] = useState(false)
	const [modalType, setModalType] = useState<"role" | "item" | null>(null)
	const [modalName, setModalName] = useState<string>("")
	const [modalData, setModalData] = useState<ModalData>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedPlayers, setExpandedPlayers] = useState<
		Record<string, boolean>
	>({})
	const tableContainerRef = useRef<HTMLDivElement>(null)
	const [isScrollable, setIsScrollable] = useState(false)

	const handleOpenModal = (type: "role" | "item", name: string) => {
		setModalType(type)
		setModalName(name)
		setModalOpen(true)
	}

	const handleCloseModal = () => {
		setModalOpen(false)
		setModalType(null)
		setModalName("")
		setModalData(null)
		setError(null)
	}

	const toggleExpand = (playerName: string) => {
		setExpandedPlayers((prev) => ({
			...prev,
			[playerName]: !prev[playerName]
		}))
	}

	// Fetch role/item/ability info when modal opens
	useEffect(() => {
		if (modalOpen && modalType && modalName) {
			setLoading(true)
			setError(null)
			fetch(`/api/${modalType}/${encodeURIComponent(modalName)}`)
				.then(async (res) => {
					if (!res.ok)
						throw new Error((await res.json()).error || "Failed to fetch info")
					return res.json()
				})
				.then((data) => {
					setModalData({ type: modalType, data })
					setLoading(false)
				})
				.catch((err) => {
					setError(err.message)
					setLoading(false)
				})
		}
	}, [modalOpen, modalType, modalName])

	useEffect(() => {
		const checkScrollable = () => {
			const el = tableContainerRef.current
			if (!el) return
			setIsScrollable(el.scrollWidth > el.clientWidth)
		}
		checkScrollable()
		window.addEventListener("resize", checkScrollable)

		const observer = new MutationObserver(checkScrollable)
		if (tableContainerRef.current) {
			observer.observe(tableContainerRef.current, {
				childList: true,
				subtree: true
			})
		}
		return () => {
			window.removeEventListener("resize", checkScrollable)
			observer.disconnect()
		}
	}, [])

	return (
		<div
			className="table-container"
			ref={tableContainerRef}
			{...(isScrollable ? { scrollable: "" } : {})}
		>
			<table className="table">
				<thead className="table-header">
					<tr>
						<th>NAME</th>
						<th>MONEY</th>
						<th>STATUS</th>
						<th>ALIAS</th>
						<th>LOCATION</th>
						<th>VOTED FOR</th>
						<th>ROLES</th>
						<th>ITEMS</th>
					</tr>
				</thead>
				<tbody>
					{players.map((player: Player) => (
						<tr key={player.name} className="table-row">
							<td className="table-cell name">{player.name}</td>
							<td className="table-cell money">{player.money}</td>
							<td
								className={`table-cell status-${
									player.isAlive ? "alive" : player.isFaked ? "faked" : "dead"
								}`}
							>
								{player.isAlive ? "Alive" : player.isFaked ? "Faked" : "Dead"}
							</td>
							<td className="table-cell alias">{player.alias || "N/A"}</td>
							<td className="table-cell location">
								{player.location?.name || "N/A"}
							</td>
							<td className="table-cell voted-for">
								{player.votedForName || "No Vote"} (worth{" "}
								{player.voteWorth || 0} vote{player.voteWorth === 1 ? "" : "s"})
							</td>
							<td className="table-cell roles">
								{player.roles && player.roles.length > 0 ? (
									<div>
										{player.roles.map((role: Player["roles"][number]) =>
											role.role?.name ? (
												<>
													<button
														key={`${player.name}-${role.role.name}`}
														className="role-item role-link"
														onClick={() =>
															handleOpenModal("role", role.role.name)
														}
														type="button"
													>
														{role.role.name}
													</button>
													<br />
												</>
											) : null
										)}
									</div>
								) : (
									<span>None</span>
								)}
							</td>
							<td className="table-cell items">
								{player.items && player.items.length > 0 ? (
									<div>
										<button
											onClick={() => toggleExpand(player.name)}
											className="outline-button"
											type="button"
										>
											{expandedPlayers[player.name] ? "Hide" : "Expand"} Items
										</button>
										{expandedPlayers[player.name] && (
											<div className="expanded-items">
												{player.items.map((item) => (
													<>
														<button
															key={`${player.name}-item-${item.item.name}`}
															className="item-button"
															onClick={() =>
																handleOpenModal("item", item.item.name)
															}
															type="button"
														>
															{item.item.name} (x{item.amount})
														</button>
														<br />
													</>
												))}
											</div>
										)}
									</div>
								) : (
									<span>None</span>
								)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<Modal open={modalOpen} onClose={handleCloseModal}>
				{loading ? (
					<div>Loading...</div>
				) : error ? (
					<div className="error-message">{error}</div>
				) : modalData ? (
					<div>
						<h2 className="modal-title">{modalData.data.name}</h2>
						{modalData.type === "role" && (
							<div>
								{modalData.data.description && (
									<p>{modalData.data.description}</p>
								)}
								{modalData.data.linkedAbilities &&
									modalData.data.linkedAbilities.length > 0 && (
										<div>
											<strong>Linked Abilities:</strong>{" "}
											{modalData.data.linkedAbilities
												.map(
													(
														a: (typeof modalData.data.linkedAbilities)[number]
													) => a.abilityName
												)
												.join(", ")}
										</div>
									)}
								{modalData.data.players &&
									modalData.data.players.length > 0 && (
										<div>
											<strong>Players:</strong>{" "}
											{modalData.data.players
												.map(
													(p: (typeof modalData.data.players)[number]) =>
														p.playerName
												)
												.join(", ")}
										</div>
									)}
							</div>
						)}
						{modalData.type === "item" && (
							<div>
								{modalData.data.description && (
									<p>{modalData.data.description}</p>
								)}
								<p>Price: {modalData.data.price}</p>
								{modalData.data.linkedAbilities &&
									modalData.data.linkedAbilities.length > 0 && (
										<div>
											<strong>Linked Abilities:</strong>{" "}
											{modalData.data.linkedAbilities
												.map(
													(
														a: (typeof modalData.data.linkedAbilities)[number]
													) => a.abilityName
												)
												.join(", ")}
										</div>
									)}
								{modalData.data.players &&
									modalData.data.players.length > 0 && (
										<div>
											<strong>Players:</strong>{" "}
											{modalData.data.players
												.map(
													(p: (typeof modalData.data.players)[number]) =>
														`${p.playerName} (x${p.amount})`
												)
												.join(", ")}
										</div>
									)}
							</div>
						)}
					</div>
				) : null}
			</Modal>
		</div>
	)
}
