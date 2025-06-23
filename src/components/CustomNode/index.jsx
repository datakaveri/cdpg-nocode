import { Handle } from "reactflow";
import styles from "./styles.module.css";

const CustomNode = ({ data }) => {
	const backgroundColor = data.color || "#E6E0F8";

	return (
		<div className={styles.nodeContainer} style={{ backgroundColor }}>
			<Handle type="target" position="left" className={styles.handle} />

			{/* Simple node - just icon and label */}
			<div className={styles.nodeContent}>
				<span className={styles.icon}>{data.icon}</span>
				{data.label}
			</div>

			<Handle type="source" position="right" className={styles.handle} />
		</div>
	);
};

export default CustomNode;
