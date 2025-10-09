import { FaPlay, FaTrash } from "react-icons/fa";

type SidebarButtonsProps = {
	handleDeploy: () => void;
	isRunning: boolean;
	clearCanvas: () => void;
};

const SidebarButtons = ({ handleDeploy, isRunning, clearCanvas }: SidebarButtonsProps) => {
	return (
		<div className="mt-8 flex flex-col gap-3">
			{/* Deploy button */}
			<button
				onClick={handleDeploy}
				disabled={isRunning}
				className={`
					flex items-center justify-center gap-2 px-4 py-3
					rounded-md font-medium text-[14px]
					text-white shadow-sm
					transition-colors duration-200
					${isRunning
						? "bg-blue-300 cursor-not-allowed"
						: "bg-[#2684ff] hover:bg-blue-600 cursor-pointer"}
				`}
			>
				<FaPlay size={14} />
				{isRunning ? "Running..." : "Deploy Workflow"}
			</button>

			{/* Clear button */}
			<button
				onClick={clearCanvas}
				className="
					flex items-center justify-center gap-2 px-4 py-3
					rounded-md font-medium text-[14px]
					text-[#666] bg-[#f8f8f8] border border-[#ddd]
					transition-all duration-200
					hover:bg-[#f3f3f3] hover:border-[#ccc]
				"
			>
				<FaTrash size={14} />
				Clear Canvas
			</button>
		</div>
	);
};

export default SidebarButtons;
