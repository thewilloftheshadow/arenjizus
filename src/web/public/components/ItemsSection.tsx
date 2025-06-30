import { DashboardData } from "~/web"

export const ItemsSection = ({ items }: { items: DashboardData["items"] }) => (
	<table className="table">
		<thead className="table-header">
			<tr>
				<th>Name</th>
				<th>Price</th>
				<th>Description</th>
				<th>Players</th>
				<th>Abilities</th>
			</tr>
		</thead>
		<tbody>
			{items.length === 0 ? (
				<tr>
					<td className="table-cell" colSpan={4}>
						No items found
					</td>
				</tr>
			) : (
				items.map((item) => (
					<tr key={item.id} className="table-row">
						<td className="table-cell font-bold">{item.name}</td>
						<td className="table-cell">${item.price}</td>
						<td className="table-cell">
							{item.description.length > 100
								? `${item.description.slice(0, 100)}...`
								: item.description}
						</td>
						<td className="table-cell">
							{item.players.filter((p) => p.amount > 0).length} players
						</td>
						<td className="table-cell">
							{item.linkedAbilities
								.map((ability) => ability.abilityName)
								.join(", ")}
						</td>
					</tr>
				))
			)}
		</tbody>
	</table>
)

export default ItemsSection
