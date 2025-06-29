import React from "react"

interface ModalProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
	if (!open) return null
	return (
		<div
			className="modal-overlay"
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				background: "rgba(0,0,0,0.5)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				zIndex: 1000
			}}
		>
			<div
				className="modal-content"
				style={{
					background: "#fff",
					borderRadius: 8,
					padding: 24,
					minWidth: 320,
					maxWidth: 480,
					boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
					position: "relative",
					color: "#111"
				}}
			>
				<button
					style={{
						position: "absolute",
						top: 8,
						right: 8,
						background: "transparent",
						border: "none",
						fontSize: 20,
						cursor: "pointer"
					}}
					onClick={onClose}
					aria-label="Close"
					type="button"
				>
					×
				</button>
				{children}
			</div>
		</div>
	)
}

export default Modal
