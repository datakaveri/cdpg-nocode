import { FaTimes } from "react-icons/fa";
import styles from "./styles.module.css";

const ParameterSidebar = ({ selectedNode, closeSidebar, onNodeDataChange }) => {
	return (
		<div className={styles.sidebar}>
			<div className={styles.header}>
				<h3 className={styles.title}>
					<span className={styles.icon}>
						{selectedNode.data.icon}
					</span>
					{selectedNode.data.label}
				</h3>
				<button className={styles.closeBtn} onClick={closeSidebar}>
					<FaTimes />
				</button>
			</div>
			<div className={styles.panel}>
				<h4 className={styles.panelTitle}>Node Parameters</h4>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						closeSidebar();
					}}
				>
					{Object.entries(selectedNode.data.params).map(
						([key, value]) => (
							<div key={key} className={styles.formGroup}>
								<label
									className={styles.label}
									htmlFor={`param-${key}`}
								>
									{key
										.replace(/_/g, " ")
										.replace(/\b\w/g, (l) =>
											l.toUpperCase()
										)}
									:
								</label>
								<input
									id={`param-${key}`}
									type="text"
									value={value || ""}
									onChange={(e) => {
										const newParams = {
											...selectedNode.data.params,
											[key]: e.target.value,
										};
										onNodeDataChange(selectedNode.id, {
											params: newParams,
										});
									}}
									className={styles.input}
								/>
							</div>
						)
					)}
					<div className={styles.buttonGroup}>
						<button
							type="button"
							onClick={closeSidebar}
							className={styles.cancelBtn}
						>
							Cancel
						</button>
						<button type="submit" className={styles.saveBtn}>
							Save
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ParameterSidebar;
