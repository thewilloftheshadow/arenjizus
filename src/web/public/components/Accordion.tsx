import { ReactNode, useState } from "react"

interface AccordionProps {
	title: string
	children: ReactNode
	defaultOpen?: boolean
	open?: boolean
	onToggle?: (open: boolean) => void
}

export const Accordion = ({
	title,
	children,
	defaultOpen = false,
	open: controlledOpen,
	onToggle
}: AccordionProps) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
	const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
	const handleToggle = () => {
		if (onToggle) {
			onToggle(!open)
		} else {
			setUncontrolledOpen((o) => !o)
		}
	}
	return (
		<div className="accordion-section">
			<button
				type="button"
				className="accordion-header"
				aria-expanded={open}
				aria-controls={`section-${title}`}
				onClick={handleToggle}
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
