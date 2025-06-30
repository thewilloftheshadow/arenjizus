import React from "react"

interface ModalProps {
	open: boolean
	onClose: () => void
	children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
	if (!open) return null
	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<button
					className="modal-close"
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
