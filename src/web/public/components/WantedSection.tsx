import { DashboardData } from "~/web"

export const WantedSection = ({
	wanted
}: {
	wanted: DashboardData["wanted"]
}) => (
	<div className="wanted-section">
		<div className={`wanted-box${wanted.name ? "" : " wanted-empty"}`}>
			{wanted.name ? (
				<span>
					{wanted.name} is currently wanted, ${wanted.price} to change
				</span>
			) : (
				<span>No wanted player set</span>
			)}
		</div>
	</div>
)

export default WantedSection
