interface Props extends React.PropsWithChildren {
	open: boolean;
	onClose: () => void;
}

export default function Modal({ children, open, onClose }: Props) {
	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
				display: open ? "flex" : "none",
				justifyContent: "center",
				alignItems: "center",
				backgroundColor: "#000000bb",
				backdropFilter: "blur(5px)",
				zIndex: 9999,
			}}
			onClick={() => {
				onClose();
			}}
		>
			<div
				onClick={(e) => {
					e.stopPropagation();
				}}
				style={{
					minHeight: 100,
					minWidth: 300,
					maxHeight: "90vh",
					maxWidth: "90vw",
					backgroundColor: "#ddd",
					borderRadius: 10,
					overflowY: "auto",
				}}
			>
				{children}
			</div>
		</div>
	);
}
