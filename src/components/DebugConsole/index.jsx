import styles from "./styles.module.css";
import { BsTerminal } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";

const DebugConsole = ({
	selectedNode,
	handleDebugConsole,
	workflowStatus,
	debugLogs,
}) => {
	return (
		<div
			className={styles.debugConsole}
			style={{
				right: selectedNode ? "360px" : 0,
			}}
		>
			<div className={styles.debugConsoleHeader}>
				<div className={styles.debugConsoleHeaderActionItems}>
					<BsTerminal className={styles.debugConsoleHeaderIcon} />
					<span className={styles.debugConsoleTitle}>
						Debug Console
					</span>
					{workflowStatus && (
						<span
							className={styles.debugConsoleHeaderMessage}
							style={{
								backgroundColor: workflowStatus
									.toLowerCase()
									.includes("succeeded")
									? "#4caf50"
									: workflowStatus
											.toLowerCase()
											.includes("failed")
									? "#f44336"
									: "#2196f3",
							}}
						>
							{workflowStatus}
						</span>
					)}
				</div>
				<button
					onClick={handleDebugConsole}
					className={styles.debugConsoleToggleButton}
				>
					<FaTimes />
				</button>
			</div>
			<div className={styles.debugConsoleContent}>
				{debugLogs.map((log, i) => (
					<div key={i} className={styles.debugConsoleLogMessage}>
						{log}
					</div>
				))}
			</div>
		</div>
	);
};

export default DebugConsole;
