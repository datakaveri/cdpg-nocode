import { BsTerminal } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";

type DebugConsoleProps = {
	handleDebugConsole: () => void;
	workflowStatus: string|null;
	debugLogs: string[];
};

const DebugConsole = ({
	handleDebugConsole,
	workflowStatus,
	debugLogs,
}: DebugConsoleProps) => {
	return (
		<div
			className="
				fixed bottom-0 left-[240px] w-full h-[200px]
				bg-[#2b2b2b] text-[#e0e0e0]
				p-2 font-mono text-xs z-[900]
				flex flex-col transition-all duration-300 ease-in-out
			"
			>
			{/* Header */}
			<div className="flex justify-between items-center mb-2 border-b border-[#444] pb-1.5" >
				<div className="flex items-center gap-2">
					<BsTerminal className="text-sm" />
					<span className="text-[13px] font-bold">Debug Console</span>

					{workflowStatus && (
						<span
							className={`
								text-white text-[12px] px-2 py-[2px] rounded-full ml-2
								${workflowStatus.toLowerCase().includes("succeeded")
									? "bg-green-600"
									: workflowStatus.toLowerCase().includes("failed")
										? "bg-red-500"
										: "bg-blue-500"
								}
							`}
						>
							{workflowStatus}
						</span>
					)}
				</div>

				<button
					onClick={handleDebugConsole}
					className="bg-transparent border-none text-gray-400 hover:text-gray-200 cursor-pointer text-sm"
				>
					<FaTimes />
				</button>
			</div>

			{/* Logs */}
			<div className="flex-1 overflow-y-auto p-1" >
				{
					debugLogs.map((log, i) => (
						<div key={i} className="my-1 whitespace-pre-wrap">
							{log}
						</div>
					))
				}
			</div>
		</div >
	);
};

export default DebugConsole;
