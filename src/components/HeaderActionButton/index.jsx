import React from "react";
import styles from "./styles.module.css";

const HeaderActionButton = ({
	handleDebugConsole,
	showDebugConsole,
	icon,
	title,
}) => {
	return (
		<button
			onClick={handleDebugConsole}
			className={styles.headerActionButton}
			style={{
				backgroundColor: showDebugConsole ? "#f0f0f0" : "transparent",
			}}
			title={title}
		>
			{icon}
		</button>
	);
};

export default HeaderActionButton;
