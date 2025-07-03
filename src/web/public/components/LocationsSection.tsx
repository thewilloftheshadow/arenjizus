import type { DashboardData } from "~/web"

export const LocationsSection = ({
	locations
}: {
	locations: DashboardData["locations"]
}) => (
	<table className="table">
		<thead className="table-header">
			<tr>
				<th>Name</th>
				<th>Description</th>
				<th>Channel</th>
				<th>Player Limit</th>
				<th>Required Item</th>
			</tr>
		</thead>
		<tbody>
			{locations.map((c) => (
				<tr key={c.id} className="table-row">
					<td className="table-cell">{c.name}</td>
					<td className="table-cell">{c.description}</td>
					<td className="table-cell">{c.channel}</td>
					<td className="table-cell">{c.maxPlayers}</td>
					<td className="table-cell">{c.requiredItemName}</td>
				</tr>
			))}
		</tbody>
	</table>
)

export default LocationsSection
