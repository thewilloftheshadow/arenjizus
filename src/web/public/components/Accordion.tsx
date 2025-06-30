import { ReactNode, useState } from "react"

interface AccordionProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
}

export const Accordion = ({
	title,
	children,
	defaultOpen = false
}: AccordionProps) => {
	const [open, setOpen] = useState(defaultOpen)
	return (
		<div className="accordion-section">
			<button
				type="button"
				className="accordion-header"
				aria-expanded={open}
				aria-controls={`section-${title}`}
				onClick={() => setOpen((o) => !o)}
			>
				{open ? "▼" : "►"} {title}
			</button>
			{open && (
				<div id={`section-${title}`} className="accordion-content">
					{children}
				</div>
			)}
		</div>
	)
}

export default Accordion
