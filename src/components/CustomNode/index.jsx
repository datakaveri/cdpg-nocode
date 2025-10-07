import { Handle } from "@xyflow/react";
import { useState } from "react";
import styles from "./styles.module.css";
import { DynamicIcon } from "lucide-react/dynamic";


const CustomNode = ({ data }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const backgroundColor = data.color || "#E6E0F8";

	const handleInfoClick = (e) => {
		e.stopPropagation();
		setShowTooltip(!showTooltip);
	};

	const handleTooltipClick = (e) => {
		e.stopPropagation();
	};

	return (
		<div className={styles.nodeContainer} style={{ backgroundColor }}>
			<Handle type="target" position="left" className="scale-150" />

			{/* Info button */}
			<div 
				className={styles.infoButton}
				onClick={handleInfoClick}
				title="Click for more information"
			>
				i
			</div>

			{/* Tooltip */}
			{showTooltip && (
				<div 
					className={`${styles.tooltip} ${styles.visible}`}
					onClick={handleTooltipClick}
				>
					<div className={styles.tooltipTitle}>
						{data.icon} {data.label}
					</div>
					<div className={styles.tooltipDescription}>
						{data.description || "No description available"}
					</div>
				</div>
			)}

			{/* Node content */}
			<div className={styles.nodeContent}>
				<span className={styles.icon}>
					<DynamicIcon name={data.icon} size={20}/>
				</span>
				<span className={styles.nodeLabel}>{data.label}</span>
			</div>
			<Handle type="source" position="right" className="scale-150" />
		</div>
	);
};

export default CustomNode;