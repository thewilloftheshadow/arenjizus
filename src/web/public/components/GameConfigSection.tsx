import type { DashboardData } from "~/web"

export const GameConfigSection = ({
	config
}: {
	config: DashboardData["config"]
}) => (
	<table className="table">
		<thead className="table-header">
			<tr>
				<th>Key</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			{config.map((c) => (
				<tr key={c.key} className="table-row">
					<td className="table-cell">{c.key}</td>
					<td className="table-cell">
						{c.value ??
							c.valueInt ??
							(typeof c.valueBoolean === "boolean"
								? c.valueBoolean.toString()
								: "")}
					</td>
				</tr>
			))}
		</tbody>
	</table>
)

export default GameConfigSection
