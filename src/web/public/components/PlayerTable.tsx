import { useEffect, useState, useRef } from "react"
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
	| { type: "ability"; data: any }
	| null

export const PlayerTable = ({ players }: { players: Player[] }) => {
	const [modalOpen, setModalOpen] = useState(false)
	const [modalType, setModalType] = useState<
		"role" | "item" | "ability" | null
	>(null)
	const [modalName, setModalName] = useState<string>("")
	const [modalData, setModalData] = useState<ModalData>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expandedPlayers, setExpandedPlayers] = useState<
		Record<string, boolean>
	>({})
	const tableContainerRef = useRef<HTMLDivElement>(null)
	const [isScrollable, setIsScrollable] = useState(false)

	const handleOpenModal = (type: "role" | "item" | "ability", name: string) => {
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
			const apiType = modalType === "ability" ? "ability" : modalType
			fetch(`/api/${apiType}/${encodeURIComponent(modalName)}`)
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
						<th>LOCATION</th>
						<th>ROLES</th>
						<th>ITEMS</th>
					</tr>
				</thead>
				<tbody>
					{players.map((player: Player) => (
						<tr key={player.name} className="table-row">
							<td className="table-cell name">{player.name}</td>
							<td className="table-cell money">{player.money}</td>
							<td className="table-cell status">
								{player.isAlive ? "Alive" : player.isFaked ? "Faked" : "Dead"}
							</td>
							<td className="table-cell location">
								{player.location?.name || "N/A"}
							</td>
							<td className="table-cell roles">
								{player.roles && player.roles.length > 0 ? (
									<div>
										{player.roles.map((role: Player["roles"][number]) =>
											role.role?.name ? (
												<>
													<button
														key={`${player.name}-${role.role.name}`}
														className="role-item"
														style={{
															cursor: "pointer",
															textDecoration: "underline",
															background: "none",
															border: "none",
															padding: 0,
															margin: 0,
															color: "inherit",
															marginRight: 4
														}}
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
											<div style={{ margin: 0, paddingLeft: 16 }}>
												{player.items.map((item) => (
													<>
														<button
															key={`${player.name}-item-${item.item.name}`}
															style={{
																cursor: "pointer",
																textDecoration: "underline",
																marginRight: 4,
																background: "none",
																border: "none",
																padding: 0,
																color: "inherit"
															}}
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
					<div style={{ color: "red" }}>{error}</div>
				) : modalData ? (
					<div>
						<h2 style={{ marginTop: 0 }}>{modalData.data.name}</h2>
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
						{modalData.type === "ability" && (
							<div>
								{modalData.data.description && (
									<p>{modalData.data.description}</p>
								)}
								{typeof modalData.data.uses !== "undefined" && (
									<p>Default Uses: {modalData.data.uses}</p>
								)}
								{modalData.data.properties &&
									modalData.data.properties !== 0 && (
										<div>
											<strong>Properties:</strong>{" "}
											{Array.isArray(modalData.data.properties)
												? modalData.data.properties.join(", ")
												: modalData.data.properties}
										</div>
									)}
								{modalData.data.linkedRoles &&
									modalData.data.linkedRoles.length > 0 && (
										<div>
											<strong>Linked Roles:</strong>{" "}
											{modalData.data.linkedRoles
												.map((r: any) => r.roleName)
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
