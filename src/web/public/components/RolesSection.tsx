import { DashboardData } from "~/web"

export const RolesSection = ({ roles }: { roles: DashboardData["roles"] }) => (
	<table className="table">
		<thead className="table-header">
			<tr>
				<th>Name</th>
				<th>Description</th>
				<th>Players</th>
				<th>Abilities</th>
			</tr>
		</thead>
		<tbody>
			{roles.length === 0 ? (
				<tr>
					<td className="table-cell" colSpan={2}>
						No roles found
					</td>
				</tr>
			) : (
				roles.map((role) => (
					<tr key={role.name} className="table-row">
						<td className="table-cell font-bold">{role.name}</td>
						<td className="table-cell">{role.description}</td>
						<td className="table-cell">{role.players.length} players</td>
						<td className="table-cell">
							{role.linkedAbilities
								.map((ability) => ability.abilityName)
								.join(", ")}
						</td>
					</tr>
				))
			)}
		</tbody>
	</table>
)

export default RolesSection
