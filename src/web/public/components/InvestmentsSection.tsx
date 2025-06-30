import { DashboardData } from "~/web"

export const InvestmentsSection = ({
	investments
}: {
	investments: DashboardData["investments"]
}) => (
	<table className="table">
		<thead className="table-header">
			<tr>
				<th>Player</th>
				<th>Amount</th>
				<th>Expires At</th>
			</tr>
		</thead>
		<tbody>
			{investments.length === 0 ? (
				<tr>
					<td className="table-cell" colSpan={3}>
						No active investments
					</td>
				</tr>
			) : (
				investments.map((inv) => (
					<tr key={inv.id} className="table-row">
						<td className="table-cell">{inv.playerName}</td>
						<td className="table-cell">${inv.amount}</td>
						<td className="table-cell">
							{new Date(inv.expiresAt).toLocaleString()}
						</td>
					</tr>
				))
			)}
		</tbody>
	</table>
)

export default InvestmentsSection
