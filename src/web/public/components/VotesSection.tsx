import { DashboardData } from "~/web"

export const VotesSection = ({ votes }: { votes: DashboardData["votes"] }) => {
	if (!votes || votes.length === 0) {
		return (
			<table className="table">
				<thead className="table-header">
					<tr>
						<th>Votes</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td className="table-cell">No votes yet.</td>
					</tr>
				</tbody>
			</table>
		)
	}

	// Group votes by votedFor
	const grouped: Record<string, { name: string; voteWorth: number }[]> = {}
	for (const vote of votes) {
		const key = vote.votedFor || "No Vote"
		if (!grouped[key]) grouped[key] = []
		grouped[key].push({ name: vote.name, voteWorth: vote.voteWorth })
	}

	const sortedGroups = Object.entries(grouped).sort((a, b) => {
		// Sort by total worth descending, then name
		const aWorth = a[1].reduce((sum, v) => sum + v.voteWorth, 0)
		const bWorth = b[1].reduce((sum, v) => sum + v.voteWorth, 0)
		if (bWorth !== aWorth) return bWorth - aWorth
		return a[0].localeCompare(b[0])
	})

	return (
		<table className="table">
			<thead className="table-header">
				<tr>
					<th>Voted For</th>
					<th>Total Votes</th>
					<th>Voters</th>
				</tr>
			</thead>
			<tbody>
				{sortedGroups.map(([votedFor, voters]) => (
					<tr key={votedFor} className="table-row">
						<td className="table-cell">{votedFor}</td>
						<td className="table-cell">
							{voters.reduce((sum, v) => sum + v.voteWorth, 0)}
						</td>
						<td className="table-cell">
							{voters.map((v) => `${v.name} (${v.voteWorth})`).join(", ")}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
