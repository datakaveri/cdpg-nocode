import React from "react";


type TempConfigType = {
	url: string;
	token: string;
}

type ConfigModalType = {
	tempConfig: TempConfigType
	setTempConfig: (params: TempConfigType) => void,
	onSave: () => void
	onClose: () => void
}

const ConfigModal = ({ tempConfig, setTempConfig, onSave, onClose }: ConfigModalType) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			backgroundColor: "rgba(0, 0, 0, 0.5)",
			display: "flex",
			justifyContent: "center",
			alignItems: "center",
			zIndex: 1100,
		}}
	>
		<div
			style={{
				width: "500px",
				backgroundColor: "white",
				borderRadius: "8px",
				padding: "24px",
				boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
			}}
		>
			<h2
				style={{
					marginTop: 0,
					marginBottom: "20px",
					fontSize: "18px",
					fontWeight: 600,
				}}
			>
				Argo Configuration
			</h2>
			<div style={{ marginBottom: "20px" }}>
				<label
					style={{
						display: "block",
						marginBottom: "8px",
						fontWeight: 500,
						fontSize: "14px",
					}}
				>
					Argo Server URL:
				</label>
				<input
					type="text"
					value={tempConfig.url}
					onChange={(e) =>
						setTempConfig({ ...tempConfig, url: e.target.value })
					}
					style={{
						width: "100%",
						padding: "10px 12px",
						borderRadius: "6px",
						border: "1px solid #ddd",
						fontSize: "14px",
						boxSizing: "border-box",
					}}
				/>
			</div>
			<div style={{ marginBottom: "24px" }}>
				<label
					style={{
						display: "block",
						marginBottom: "8px",
						fontWeight: 500,
						fontSize: "14px",
					}}
				>
					Authentication Token:
				</label>
				<textarea
					value={tempConfig.token}
					onChange={(e) =>
						setTempConfig({ ...tempConfig, token: e.target.value })
					}
					style={{
						width: "100%",
						height: "120px",
						padding: "10px 12px",
						borderRadius: "6px",
						border: "1px solid #ddd",
						fontSize: "14px",
						boxSizing: "border-box",
						fontFamily: "monospace",
						resize: "vertical",
					}}
				/>
			</div>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: "12px",
				}}
			>
				<button
					onClick={onClose}
					style={{
						padding: "10px 16px",
						backgroundColor: "#f8f8f8",
						border: "1px solid #ddd",
						borderRadius: "6px",
						fontSize: "14px",
						cursor: "pointer",
					}}
				>
					Cancel
				</button>
				<button
					onClick={onSave}
					style={{
						padding: "10px 16px",
						backgroundColor: "#2684ff",
						color: "white",
						border: "none",
						borderRadius: "6px",
						fontSize: "14px",
						cursor: "pointer",
					}}
				>
					Save
				</button>
			</div>
		</div>
	</div>
);

export default ConfigModal;
