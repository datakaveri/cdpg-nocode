import { Handle } from "reactflow";
import { useMemo, useState } from "react";
import styles from "./styles.module.css";

const CustomNode = ({ data }) => {
	const [showTooltip, setShowTooltip] = useState(false);
	const backgroundColor = data.color || "#E6E0F8";

    const hasOutputs = Array.isArray(data.outputs) && data.outputs.length > 0;
    const condensedItems = useMemo(() => {
        if (!hasOutputs) return [];
        return data.outputs.slice(0, 2).map((out, idx) => ({ ...out, key: idx }));
    }, [data.outputs, hasOutputs]);

	const handleInfoClick = (e) => {
		e.stopPropagation();
		setShowTooltip(!showTooltip);
	};

	const handleTooltipClick = (e) => {
		e.stopPropagation();
	};

	return (
		<div className={styles.nodeContainer} style={{ backgroundColor }}>
			<Handle type="target" position="left" className={styles.handle} />

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
				<span className={styles.icon}>{data.icon}</span>
				<span className={styles.nodeLabel}>{data.label}</span>
			</div>

            {hasOutputs && (
                <div className={styles.outputBadgesContainer}>
                    {condensedItems.map((out) => (
                        <div
                            key={out.key}
                            className={styles.outputBadge}
                            title={out.type.toUpperCase()}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (data.onOpenOutput) data.onOpenOutput(out);
                            }}
                        >
                            {out.type === "csv" ? "📄" : "📊"}
                        </div>
                    ))}
                    {data.outputs.length > 2 && (
                        <div className={styles.outputBadgeMore}
                             title={`+${data.outputs.length - 2} more`}
                             onClick={(e) => {
                                e.stopPropagation();
                                if (data.onOpenAllOutputs) data.onOpenAllOutputs();
                             }}
                        >
                            +{data.outputs.length - 2}
                        </div>
                    )}
                </div>
            )}

			<Handle type="source" position="right" className={styles.handle} />
		</div>
	);
};

export default CustomNode;