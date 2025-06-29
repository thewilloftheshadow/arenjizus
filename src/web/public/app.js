import React from "react"
import { createRoot } from "react-dom/client"
import { DatabaseView } from "./components/DatabaseView.js"

const App = () => {
	return (
		<div className="container">
			<div className="max-width">
				<DatabaseView />
			</div>
		</div>
	)
}

const root = createRoot(document.getElementById("root"))
root.render(<App />)
