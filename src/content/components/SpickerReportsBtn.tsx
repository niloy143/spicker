import { useState } from "react";
import Modal from "./Modal";
import Stats from "./Stats";

export default function SpickerReportsBtn() {
	const [modalOpen, setModalOpen] = useState(false);

	return (
		<>
			<a
				className="abstract_link reports_export_button is-pdf is-link is-border_radius_soft is-button_size_small is-style_tertiary"
				onClick={() => {
					setModalOpen(true);
				}}
			>
				Spicker Reports
			</a>
			<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
				<Stats />
			</Modal>
		</>
	);
}
