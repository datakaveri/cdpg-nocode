import styles from "./styles.module.css";

const ConfigModal = ({
	tempConfig,
	handleConfigModal,
	handleConfigSave,
	setTempConfig,
}) => {
	return (
		<div className={styles.modalOverlay}>
			<div className={styles.modalContent}>
				<h2 className={styles.modalTitle}>Argo Configuration</h2>
				<div style={{ marginBottom: "20px" }}>
					<label className={styles.inputLabel}>
						Argo Server URL:
					</label>
					<input
						type="text"
						value={tempConfig.url}
						onChange={(e) =>
							setTempConfig({
								...tempConfig,
								url: e.target.value,
							})
						}
						className={styles.inputField}
					/>
				</div>
				<div style={{ marginBottom: "24px" }}>
					<label className={styles.inputLabel}>
						Authentication Token:
					</label>
					<textarea
						value={tempConfig.token}
						onChange={(e) =>
							setTempConfig({
								...tempConfig,
								token: e.target.value,
							})
						}
						className={styles.textareaField}
					/>
				</div>
				<div className={styles.buttonGroup}>
					<button
						onClick={handleConfigModal}
						className={styles.cancelButton}
					>
						Cancel
					</button>
					<button
						onClick={handleConfigSave}
						className={styles.saveButton}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfigModal;
