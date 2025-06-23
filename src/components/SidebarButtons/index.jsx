import { FaPlay, FaTrash } from "react-icons/fa";
import styles from "./styles.module.css";

const SidebarButtons = ({ handleDeploy, isRunning, clearCanvas }) => {
	return (
		<div className={styles.sidebarButtonsContainer}>
			<button
				onClick={handleDeploy}
				disabled={isRunning}
				className={
					styles.deployButton +
					(isRunning ? ` ${styles.deployButtonDisabled}` : "")
				}
			>
				<FaPlay size={14} />
				{isRunning ? "Running..." : "Deploy Workflow"}
			</button>

			<button onClick={clearCanvas} className={styles.clearButton}>
				<FaTrash size={14} />
				Clear Canvas
			</button>
		</div>
	);
};

export default SidebarButtons;
