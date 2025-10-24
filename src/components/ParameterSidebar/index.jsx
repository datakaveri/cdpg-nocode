import { FaTimes } from "react-icons/fa";
import styles from "./styles.module.css";

const ParameterSidebar = ({ selectedNode, closeSidebar, onNodeDataChange }) => {
	// Define dropdown options for plot node
	const plotTypeOptions = ["pie", "bar", "line", "network", "heatmap"];
	const operationOptions = ["mean", "median", "mode", "std", "correlation"];

	// Helper function to determine if a parameter should use a dropdown
	const shouldUseDropdown = (key) => {
		if (selectedNode.data.label === "plot") {
			if (key === "plot_type") return { options: plotTypeOptions };
			if (key === "operation") return { options: operationOptions };
		}
		return null;
	};

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
						([key, value]) => {
							const dropdownConfig = shouldUseDropdown(key);
							
							return (
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
									{dropdownConfig ? (
										<select
											id={`param-${key}`}
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
										>
											<option value="">Select {key.replace(/_/g, " ")}</option>
											{dropdownConfig.options.map((option) => (
												<option key={option} value={option}>
													{option}
												</option>
											))}
										</select>
									) : (
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
									)}
								</div>
							);
						}
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
