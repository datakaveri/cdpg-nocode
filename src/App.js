import { useCallback, useState, useEffect } from "react";
import ReactFlow, {
	Controls,
	Background,
	useNodesState,
	useEdgesState,
	addEdge,
	MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./components/CustomNode";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IcmrArgoClient } from "./IcmrArgoClient";
import { generateArgoWorkflow } from "./argoWorkflowUtils";
import { sleep } from "./utils";

// Icons
import { BsTerminal } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";
import { FaTimes, FaPlay, FaTrash } from "react-icons/fa";

const nodeTypes = {
	custom: CustomNode,
};

const initialNodes = [
	{
		id: "load-dataset-1",
		position: { x: 250, y: 100 },
		data: {
			label: "load-dataset",
			params: {
				base_url: "https://fhir.rs.adarv.in/fhir",
				processed_data_path: "processed_data.csv",
				patients_df_path: "patients_df.csv",
				obs_names_path: "obs_names.pkl",
				cond_names_path: "cond_names.pkl",
				dataset_name: "LeptoDemo",
			},
			icon: "📥",
			color: "#E6897E",
			type: "load-dataset",
		},
		type: "custom",
	},
];

const initialEdges = [];

// Updated nodeTemplates array - replace the existing one in App.js
const nodeTemplates = [
	{
		label: "load-dataset",
		type: "custom",
		icon: "📥",
		color: "#E6897E",
		type: "load-dataset",
		params: {
			base_url: "https://fhir.rs.adarv.in/fhir",
			processed_data_path: "processed_data.csv",
			patients_df_path: "patients_df.csv",
			obs_names_path: "obs_names.pkl",
			cond_names_path: "cond_names.pkl",
			dataset_name: "LeptoDemo",
			minio_endpoint: "minio-service:9000",
			minio_access_key: "minioadmin",
			minio_secret_key: "minioadmin",
			minio_secure: "False",
		},
	},
	{
		label: "correlation",
		type: "custom",
		icon: "🔗",
		color: "#B87EE6",
		type: "correlation",
		params: {
			input: "processed_data.csv",
			obs_names_path: "obs_names.pkl",
			cond_names_path: "cond_names.pkl",
		},
	},
	{
		label: "condition",
		type: "custom",
		icon: "🏥",
		color: "#7EE6B8",
		type: "condition",
		params: {
			input: "patients_df.csv",
		},
	},
	{
		label: "observation",
		type: "custom",
		icon: "🔍",
		color: "#7EB8E6",
		type: "observation",
		params: {
			input: "patients_df.csv",
		},
	},
	{
		label: "cluster",
		type: "custom",
		icon: "🎯",
		color: "#E6B87E",
		type: "cluster",
		params: {
			file: "processed_data.csv",
			features: "",
			clusters: "3",
			topx: "10",
		},
	},
	{
		label: "frequency",
		type: "custom",
		icon: "📊",
		color: "#7EE6E6",
		type: "frequency",
		params: {
			file: "processed_data.csv",
			column: "",
			proportion: "false",
		},
	},
	{
		label: "range",
		type: "custom",
		icon: "📏",
		color: "#E67EB8",
		type: "range",
		params: {
			file: "processed_data.csv",
			column: "",
		},
	},
	{
		label: "std",
		type: "custom",
		icon: "📐",
		color: "#B8E67E",
		type: "std",
		params: {
			file: "processed_data.csv",
			column: "",
		},
	},
	{
		label: "mode",
		type: "custom",
		icon: "🎲",
		color: "#E6E67E",
		type: "mode",
		params: {
			file: "processed_data.csv",
			column: "",
		},
	},
	{
		label: "median",
		type: "custom",
		icon: "📊",
		color: "#7E7EE6",
		type: "median",
		params: {
			file: "processed_data.csv",
			column: "",
		},
	},
	{
		label: "mean",
		type: "custom",
		icon: "📈",
		color: "#E67E7E",
		type: "mean",
		params: {
			file: "processed_data.csv",
			column: "",
		},
	},
	{
		label: "abbreviate",
		type: "custom",
		icon: "🔠",
		color: "#7EE67E",
		type: "abbreviate",
		params: {
			processed_data_path: "processed_data.csv",
			obs_names_path: "obs_names.pkl",
			cond_names_path: "cond_names.pkl",
			abbr_path: "abbreviation_data.csv",
		},
	},
	{
		label: "plot",
		type: "custom",
		icon: "📊",
		color: "#B87E7E",
		type: "plot",
		params: {
			data_file: "",
			csv_file: "",
			plot_type: "bar",
			operation: "",
			title: "",
			x_label: "",
			y_label: "",
			color_column: "",
			size_column: "",
			facet_column: "",
			width: "800",
			height: "600",
			output: "",
		},
	},
];

function App() {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
	const [selectedNode, setSelectedNode] = useState(null);
	const [intermediateJson, setIntermediateJson] = useState(null);
	const [isRunning, setIsRunning] = useState(false);
	const [debugLogs, setDebugLogs] = useState([]);
	const [showDebugConsole, setShowDebugConsole] = useState(false);
	const [workflowStatus, setWorkflowStatus] = useState(null);
	const [argoConfig, setArgoConfig] = useState({
		url: "http://localhost:8080",
		token: "eyJhbGciOiJSUzI1NiIsImtpZCI6IlJ0eDJ4dmRxMVRXNERMaGZXU3dWY3BrcTdCajNCNWdCZkJnNzljaXpIQU0ifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjoxNzc1MDc0Mjg1LCJpYXQiOjE3NDM1MzgyODUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwianRpIjoiZGU0MmIyNDItYmY0Mi00MmU4LWI4MDUtYWM1YTBlODJjY2M2Iiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJhcmdvIiwibm9kZSI6eyJuYW1lIjoibWluaWt1YmUiLCJ1aWQiOiI0ZmE1YzI4Ni00YTJiLTRiMjMtOWI5YS00NzJjMDQzYjNkNTQifSwicG9kIjp7Im5hbWUiOiJhcmdvLXNlcnZlci02YmZkZjhmNjk2LWZoY3RoIiwidWlkIjoiZmQ4YmZjMDgtNzllMy00YTZiLWI2NWMtYzc4OWQxMjMxYjNlIn0sInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJhcmdvLXNlcnZlciIsInVpZCI6ImE3MWRmYTRkLWQ3ZTAtNDhjYi1hYzRmLTQ5Y2UxMjAyOTM2YSJ9LCJ3YXJuYWZ0ZXIiOjE3NDM1NDE4OTJ9LCJuYmYiOjE3NDM1MzgyODUsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDphcmdvOmFyZ28tc2VydmVyIn0.IjczyolfCnkNkoR40BsSJPrm-83fOiKRmu5TORTgxXkdef_ZkHtNnsBfppztQQmDChx4KD7yJoZdLnrjRuomFdUzcCzZyCr-dAbgnHdVxh1gVyBBPyJG0AAHK5qlxYWsXlxXUwuuN-GqtKs0HOlGRMbA5hOy9OE5IK9zX9X913dK1sBB2pWJBI6Vl_KOiYM5-txX6x5CP4qq_3G99qYkMvvV7Q0H-pum7j_1dbc54ZY6oTaV8RzjwXqfhtSmgtsI3nbuuf7ZS858rqnX3bfnshPsKDibbgxFfX1WA31WvpgnI8-o3BfzVP_yJvQ2HUr_2q4B1IlMdFOLlAKRSIVwhQ",
	});

	useEffect(() => {
		const savedConfig = localStorage.getItem("argoConfig");
		if (savedConfig) {
			setArgoConfig(JSON.parse(savedConfig));
		}
	}, []);

	const saveArgoConfig = (config) => {
		setArgoConfig(config);
		localStorage.setItem("argoConfig", JSON.stringify(config));
	};

	const onDrop = useCallback(
		(event) => {
			event.preventDefault();

			const nodeTypeData = event.dataTransfer.getData(
				"application/reactflow"
			);
			if (!nodeTypeData) return;

			const nodeTemplate = JSON.parse(nodeTypeData);

			const reactFlowBounds = document
				.querySelector(".react-flow")
				.getBoundingClientRect();
			const position = {
				x: event.clientX - reactFlowBounds.left,
				y: event.clientY - reactFlowBounds.top,
			};

			const uuid = generateUUID();
			const nodeId = `${nodeTemplate.label}-${uuid}`;

			const newNode = {
				id: nodeId,
				type: "custom",
				position,
				data: {
					label: nodeTemplate.label,
					params: {
						...nodeTemplate.params,
					},
					icon: nodeTemplate.icon,
					color: nodeTemplate.color,
					type: nodeTemplate.type,
				},
			};

			setNodes((nds) => nds.concat(newNode));
		},
		[setNodes]
	);

	const generateUUID = () => {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
			/[xy]/g,
			function (c) {
				const r = (Math.random() * 16) | 0,
					v = c === "x" ? r : (r & 0x3) | 0x8;
				return v.toString(16);
			}
		);
	};

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = "move";
	}, []);

	const onConnect = useCallback(
		(params) => {
			const newEdge = {
				id: `e${params.source}-${params.target}`,
				source: params.source,
				target: params.target,
				animated: true,
				style: { stroke: "#555", strokeWidth: 2 },
			};
			setEdges((eds) => addEdge(newEdge, eds));
		},
		[setEdges]
	);

	const onNodeDataChange = useCallback(
		(id, newData) => {
			setNodes((nds) =>
				nds.map((node) => {
					if (node.id === id) {
						// Handle the case where we're updating params specifically
						if (newData.params) {
							return {
								...node,
								data: {
									...node.data,
									params: {
										...node.data.params,
										...newData.params,
									},
								},
							};
						}
						// Handle other data updates
						return { ...node, data: { ...node.data, ...newData } };
					}
					return node;
				})
			);
		},
		[setNodes]
	);

	const onNodeClick = useCallback((event, node) => {
		setSelectedNode(node);
	}, []);

	const closeSidebar = () => {
		setSelectedNode(null);
	};

	const hasLoop = () => {
		const visited = new Set();
		const stack = new Set();

		const dfs = (nodeId) => {
			if (stack.has(nodeId)) return true;
			if (visited.has(nodeId)) return false;

			visited.add(nodeId);
			stack.add(nodeId);

			const outgoingEdges = edges.filter(
				(edge) => edge.source === nodeId
			);
			for (const edge of outgoingEdges) {
				if (dfs(edge.target)) return true;
			}

			stack.delete(nodeId);
			return false;
		};

		for (const node of nodes) {
			if (!visited.has(node.id) && dfs(node.id)) {
				return true;
			}
		}

		return false;
	};

	const findRootNode = () => {
		const hasIncomingEdge = new Set();
		edges.forEach(({ target }) => hasIncomingEdge.add(target));

		const rootNodes = nodes.filter((node) => !hasIncomingEdge.has(node.id));

		if (rootNodes.length === 0) {
			throw new Error("Can't run the workflow: No root node found.");
		}

		if (rootNodes.length > 1) {
			throw new Error(
				"Can't run the workflow: Multiple root nodes found. The flow should have a single starting point."
			);
		}

		return rootNodes[0];
	};

	const levelTraverse = (rootId) => {
		const result = [];
		const visited = new Set();
		const queue = [rootId];

		const graph = new Map();
		nodes.forEach((node) => graph.set(node.id, new Set()));
		edges.forEach((edge) => {
			const children = graph.get(edge.source) || new Set();
			children.add(edge.target);
			graph.set(edge.source, children);
		});

		while (queue.length > 0) {
			const levelSize = queue.length;
			const currentLevel = [];

			for (let i = 0; i < levelSize; i++) {
				const currentNode = queue.shift();
				if (!visited.has(currentNode)) {
					visited.add(currentNode);
					currentLevel.push(currentNode);

					const children = graph.get(currentNode) || new Set();
					queue.push(...Array.from(children));
				}
			}

			result.push(...currentLevel);
		}

		return result;
	};

	const createIntermediateState = (nodeIds) => {
		return nodeIds
			.map((nodeId) => {
				const node = nodes.find((n) => n.id === nodeId);
				if (!node || !node.data) return null;

				const dependsOn = edges
					.filter((edge) => edge.target === nodeId)
					.map((edge) => edge.source);

				// Filter out empty parameters
				const filteredParams = Object.fromEntries(
					Object.entries(node.data.params).filter(
						([_, v]) => v !== ""
					)
				);

				return {
					data: filteredParams,
					info: {
						id: node.id,
						depends: dependsOn,
						type: node.data.type,
					},
				};
			})
			.filter(Boolean);
	};

	const handleDeploy = async () => {
		try {
			setDebugLogs(["Starting deployment..."]);
			setWorkflowStatus("Preparing");
			setIsRunning(true);
			setShowDebugConsole(true);

			if (!nodes || nodes.length === 0) {
				throw new Error("No nodes in workflow");
			}

			const rootNode = findRootNode();
			const nodeOrder = levelTraverse(rootNode.id);
			const intermediateState = createIntermediateState(nodeOrder);
			setIntermediateJson(intermediateState);

			const client = new IcmrArgoClient(argoConfig.url, argoConfig.token);

			setDebugLogs((prev) => [...prev, "Testing Argo connection..."]);
			await client.testConnection();
			setDebugLogs((prev) => [...prev, "✓ Connection successful"]);

			const workflowName = `icmr-${Date.now()}`;
			const workflow = generateArgoWorkflow(
				workflowName,
				intermediateState
			);

			setDebugLogs((prev) => [...prev, "Submitting workflow..."]);
			const response = await client.submitWorkflow(workflow);
			setDebugLogs((prev) => [...prev, "✓ Workflow submitted"]);
			setWorkflowStatus("Submitted");

			// Extract the actual workflow name from the response
			const actualWorkflowName = response.metadata?.name || workflowName;
			setDebugLogs((prev) => [
				...prev,
				`Actual workflow name: ${actualWorkflowName}`,
			]);

			await monitorWorkflow(client, actualWorkflowName);
		} catch (error) {
			setDebugLogs((prev) => [...prev, `✗ Error: ${error.message}`]);
			setWorkflowStatus("Failed");
			toast.error(`Deployment failed: ${error.message}`);
		} finally {
			setIsRunning(false);
		}
	};

	async function monitorWorkflow(client, workflowName) {
		const startTime = Date.now();
		const timeout = 300000; // 5 minutes
		let attempts = 0;

		while (Date.now() - startTime < timeout) {
			attempts++;
			try {
				setDebugLogs((prev) => [
					...prev,
					`Checking status (${attempts})...`,
				]);
				setWorkflowStatus("Checking status...");

				const status = await client.getStatus(workflowName);
				// Safely extract the status and convert to string if necessary
				const currentStatus = status?.status?.toString() || "Unknown";
				setWorkflowStatus(currentStatus);

				if (
					typeof currentStatus === "string" &&
					currentStatus.toLowerCase().includes("succeeded")
				) {
					setDebugLogs((prev) => [
						...prev,
						"Workflow completed successfully!",
					]);
					toast.success("Workflow succeeded!");
					return;
				}

				if (
					typeof currentStatus === "string" &&
					currentStatus.toLowerCase().includes("failed")
				) {
					throw new Error(`Workflow failed: ${currentStatus}`);
				}

				await sleep(5000); // Check every 5 seconds
			} catch (error) {
				setDebugLogs((prev) => [
					...prev,
					`Status check error: ${error.message}`,
				]);
				if (!error.message.includes("timed out")) throw error;
			}
		}

		throw new Error("Workflow monitoring timed out");
	}

	const [showConfigModal, setShowConfigModal] = useState(false);
	const [tempConfig, setTempConfig] = useState({ ...argoConfig });

	const handleConfigSave = () => {
		saveArgoConfig(tempConfig);
		setShowConfigModal(false);
		toast.success("Argo configuration saved!");
	};

	const clearCanvas = () => {
		if (
			window.confirm(
				"Are you sure you want to clear the canvas? All nodes and connections will be removed."
			)
		) {
			setNodes([]);
			setEdges([]);
			toast.info("Canvas cleared");
		}
	};

	return (
		<div
			className="app-container"
			style={{
				display: "flex",
				width: "100vw",
				height: "100vh",
				fontFamily: "'Inter', sans-serif",
			}}
		>
			<ToastContainer position="top-right" autoClose={3000} />

			{/* Header */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					height: "60px",
					backgroundColor: "#ffffff",
					borderBottom: "1px solid #e0e0e0",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					padding: "0 20px",
					zIndex: 900,
					boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center" }}>
					<h1
						style={{
							fontSize: "1.4rem",
							fontWeight: 600,
							margin: 0,
							color: "#333",
						}}
					>
						ICMR Workflow Designer
					</h1>
				</div>
				<div style={{ display: "flex", gap: "15px" }}>
					<button
						onClick={() => setShowDebugConsole(!showDebugConsole)}
						style={{
							background: "none",
							border: "none",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							fontSize: "1.2rem",
							color: "#555",
							padding: "8px",
							borderRadius: "4px",
							backgroundColor: showDebugConsole
								? "#f0f0f0"
								: "transparent",
						}}
						title="Toggle Debug Console"
					>
						<BsTerminal />
					</button>
					<button
						onClick={() => setShowConfigModal(true)}
						style={{
							background: "none",
							border: "none",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							fontSize: "1.2rem",
							color: "#555",
							padding: "8px",
							borderRadius: "4px",
						}}
						title="Configure Argo"
					>
						<IoMdSettings />
					</button>
				</div>
			</div>

			{/* Sidebar for drag-and-drop */}
			<aside
				style={{
					width: "240px",
					padding: "20px",
					borderRight: "1px solid #e0e0e0",
					backgroundColor: "#f8f8f8",
					marginTop: "60px",
					height: "calc(100vh - 60px)",
					overflow: "auto",
					zIndex: 800,
				}}
			>
				<h3
					style={{
						marginBottom: "20px",
						fontSize: "16px",
						fontWeight: 600,
						color: "#333",
					}}
				>
					Node Palette
				</h3>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					{nodeTemplates.map((template, index) => (
						<div
							key={index}
							style={{
								padding: "14px",
								backgroundColor: template.color || "#f1f1f1",
								color: "#333",
								border: "1px solid rgba(0, 0, 0, 0.06)",
								borderRadius: "8px",
								cursor: "grab",
								display: "flex",
								alignItems: "center",
								fontSize: "14px",
								boxShadow: "0 2px 5px rgba(0, 0, 0, 0.06)",
								transition:
									"transform 0.15s ease, box-shadow 0.15s ease",
								fontWeight: 500,
							}}
							onDragStart={(event) => {
								event.dataTransfer.setData(
									"application/reactflow",
									JSON.stringify(template)
								);
							}}
							draggable
							onMouseDown={(e) => {
								e.currentTarget.style.transform = "scale(0.98)";
								e.currentTarget.style.boxShadow =
									"0 1px 3px rgba(0, 0, 0, 0.08)";
							}}
							onMouseUp={(e) => {
								e.currentTarget.style.transform = "scale(1)";
								e.currentTarget.style.boxShadow =
									"0 2px 5px rgba(0, 0, 0, 0.06)";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.transform = "scale(1)";
								e.currentTarget.style.boxShadow =
									"0 2px 5px rgba(0, 0, 0, 0.06)";
							}}
						>
							<span
								style={{
									marginRight: "10px",
									fontSize: "20px",
								}}
							>
								{template.icon}
							</span>
							{template.label}
						</div>
					))}
				</div>

				<div
					style={{
						marginTop: "30px",
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					<button
						onClick={handleDeploy}
						disabled={isRunning}
						style={{
							padding: "12px",
							backgroundColor: isRunning ? "#88b7d9" : "#2684ff",
							color: "white",
							border: "none",
							borderRadius: "6px",
							cursor: isRunning ? "not-allowed" : "pointer",
							fontWeight: 500,
							fontSize: "14px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							transition: "background-color 0.2s ease",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<FaPlay size={14} />
						{isRunning ? "Running..." : "Deploy Workflow"}
					</button>

					<button
						onClick={clearCanvas}
						style={{
							padding: "12px",
							backgroundColor: "#f8f8f8",
							color: "#666",
							border: "1px solid #ddd",
							borderRadius: "6px",
							cursor: "pointer",
							fontWeight: 500,
							fontSize: "14px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							transition: "all 0.2s ease",
						}}
						onMouseOver={(e) => {
							e.currentTarget.style.backgroundColor = "#f3f3f3";
							e.currentTarget.style.borderColor = "#ccc";
						}}
						onMouseOut={(e) => {
							e.currentTarget.style.backgroundColor = "#f8f8f8";
							e.currentTarget.style.borderColor = "#ddd";
						}}
					>
						<FaTrash size={14} />
						Clear Canvas
					</button>
				</div>
			</aside>

			{/* React Flow wrapper */}
			<div
				style={{
					flex: 1,
					position: "relative",
					height: "calc(100vh - 60px)",
					marginTop: "60px",
				}}
				className="reactflow-wrapper"
				onDrop={onDrop}
				onDragOver={onDragOver}
			>
				<ReactFlow
					nodes={nodes}
					edges={edges}
					onNodesChange={onNodesChange}
					onEdgesChange={onEdgesChange}
					onConnect={onConnect}
					onNodeClick={onNodeClick}
					nodeTypes={nodeTypes}
					fitView
					snapToGrid={true}
					snapGrid={[15, 15]}
					defaultEdgeOptions={{
						style: { stroke: "#555", strokeWidth: 2 },
						animated: true,
						type: "default",
					}}
				>
					<Background color="#f5f5f5" gap={16} size={1} />
					<Controls
						style={{
							borderRadius: "8px",
							boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
							backgroundColor: "#ffffff",
						}}
					/>
					<MiniMap
						nodeStrokeColor={(n) => n.data?.color || "#555"}
						nodeColor={(n) => n.data?.color || "#fff"}
						maskColor="rgba(240, 240, 240, 0.6)"
						style={{
							right: 12,
							bottom: 12,
							borderRadius: "8px",
							boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
						}}
					/>
				</ReactFlow>
			</div>

			{/* Parameter editing sidebar */}
			{selectedNode && (
				<div
					style={{
						position: "fixed",
						top: "60px",
						right: 0,
						width: "360px",
						height: "calc(100vh - 60px)",
						backgroundColor: "#fff",
						boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.08)",
						padding: "20px",
						overflowY: "auto",
						zIndex: 1000,
						transition: "transform 0.3s ease-in-out",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "24px",
						}}
					>
						<h3
							style={{
								margin: 0,
								fontSize: "18px",
								fontWeight: 600,
								color: "#333",
							}}
						>
							<span style={{ marginRight: "10px" }}>
								{selectedNode.data.icon}
							</span>
							{selectedNode.data.label}
						</h3>
						<button
							style={{
								background: "none",
								border: "none",
								fontSize: "18px",
								cursor: "pointer",
								color: "#666",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								width: "30px",
								height: "30px",
								borderRadius: "4px",
								transition: "background-color 0.2s",
							}}
							onClick={closeSidebar}
							onMouseOver={(e) =>
								(e.currentTarget.style.backgroundColor =
									"#f0f0f0")
							}
							onMouseOut={(e) =>
								(e.currentTarget.style.backgroundColor =
									"transparent")
							}
						>
							<FaTimes />
						</button>
					</div>
					<div
						style={{
							padding: "18px",
							backgroundColor: "#f9f9f9",
							borderRadius: "8px",
							border: "1px solid #eaeaea",
						}}
					>
						<h4
							style={{
								marginTop: 0,
								marginBottom: "20px",
								fontSize: "16px",
								fontWeight: 500,
								color: "#444",
							}}
						>
							Node Parameters
						</h4>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								closeSidebar();
							}}
						>
							{Object.entries(selectedNode.data.params).map(
								([key, value]) => (
									<div
										key={key}
										style={{ marginBottom: "16px" }}
									>
										<label
											style={{
												display: "block",
												marginBottom: "6px",
												fontWeight: 500,
												fontSize: "14px",
												color: "#444",
											}}
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
											value={value || ""} // Adding || '' to ensure value is never undefined
											onChange={(e) => {
												const newParams = {
													...selectedNode.data.params,
													[key]: e.target.value,
												};

												// Update the node data
												onNodeDataChange(
													selectedNode.id,
													{
														params: newParams,
													}
												);
											}}
											style={{
												width: "100%",
												padding: "10px 12px",
												borderRadius: "6px",
												border: "1px solid #ddd",
												fontSize: "14px",
												boxSizing: "border-box",
												transition: "border-color 0.2s",
											}}
											onFocus={(e) =>
												(e.target.style.borderColor =
													"#2684ff")
											}
											onBlur={(e) =>
												(e.target.style.borderColor =
													"#ddd")
											}
										/>
									</div>
								)
							)}
							<div
								style={{
									display: "flex",
									justifyContent: "flex-end",
									gap: "12px",
									marginTop: "24px",
								}}
							>
								<button
									type="button"
									onClick={closeSidebar}
									style={{
										padding: "8px 16px",
										backgroundColor: "#f8f8f8",
										border: "1px solid #ddd",
										borderRadius: "6px",
										fontSize: "14px",
										cursor: "pointer",
										color: "#555",
									}}
								>
									Cancel
								</button>
								<button
									type="submit"
									style={{
										padding: "8px 16px",
										backgroundColor: "#2684ff",
										color: "white",
										border: "none",
										borderRadius: "6px",
										fontSize: "14px",
										cursor: "pointer",
									}}
								>
									Save
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Debug Console */}
			{showDebugConsole && (
				<div
					style={{
						position: "fixed",
						bottom: 0,
						left: "240px",
						right: selectedNode ? "360px" : 0,
						height: "200px",
						backgroundColor: "#2b2b2b",
						color: "#e0e0e0",
						padding: "10px",
						fontFamily: "monospace",
						fontSize: "12px",
						zIndex: 900,
						display: "flex",
						flexDirection: "column",
						transition: "height 0.3s ease",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							marginBottom: "10px",
							borderBottom: "1px solid #444",
							paddingBottom: "6px",
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "10px",
							}}
						>
							<BsTerminal style={{ fontSize: "14px" }} />
							<span
								style={{ fontSize: "13px", fontWeight: "bold" }}
							>
								Debug Console
							</span>
							{workflowStatus && (
								<span
									style={{
										fontSize: "12px",
										padding: "2px 8px",
										borderRadius: "10px",
										backgroundColor: workflowStatus
											.toLowerCase()
											.includes("succeeded")
											? "#4caf50"
											: workflowStatus
													.toLowerCase()
													.includes("failed")
											? "#f44336"
											: "#2196f3",
										color: "white",
										marginLeft: "10px",
									}}
								>
									{workflowStatus}
								</span>
							)}
						</div>
						<button
							onClick={() => setShowDebugConsole(false)}
							style={{
								background: "none",
								border: "none",
								color: "#888",
								cursor: "pointer",
								fontSize: "14px",
							}}
						>
							<FaTimes />
						</button>
					</div>
					<div
						style={{
							flex: 1,
							overflowY: "auto",
							padding: "4px",
						}}
					>
						{debugLogs.map((log, i) => (
							<div
								key={i}
								style={{
									margin: "4px 0",
									whiteSpace: "pre-wrap",
								}}
							>
								{log}
							</div>
						))}
					</div>
				</div>
			)}

			{/* Config Modal */}
			{showConfigModal && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						zIndex: 1100,
					}}
				>
					<div
						style={{
							width: "500px",
							backgroundColor: "white",
							borderRadius: "8px",
							padding: "24px",
							boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
						}}
					>
						<h2
							style={{
								marginTop: 0,
								marginBottom: "20px",
								fontSize: "18px",
								fontWeight: 600,
							}}
						>
							Argo Configuration
						</h2>
						<div style={{ marginBottom: "20px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontWeight: 500,
									fontSize: "14px",
								}}
							>
								Argo Server URL:
							</label>
							<input
								type="text"
								value={tempConfig.url}
								onChange={(e) =>
									setTempConfig({
										...tempConfig,
										url: e.target.value,
									})
								}
								style={{
									width: "100%",
									padding: "10px 12px",
									borderRadius: "6px",
									border: "1px solid #ddd",
									fontSize: "14px",
									boxSizing: "border-box",
								}}
							/>
						</div>
						<div style={{ marginBottom: "24px" }}>
							<label
								style={{
									display: "block",
									marginBottom: "8px",
									fontWeight: 500,
									fontSize: "14px",
								}}
							>
								Authentication Token:
							</label>
							<textarea
								value={tempConfig.token}
								onChange={(e) =>
									setTempConfig({
										...tempConfig,
										token: e.target.value,
									})
								}
								style={{
									width: "100%",
									height: "120px",
									padding: "10px 12px",
									borderRadius: "6px",
									border: "1px solid #ddd",
									fontSize: "14px",
									boxSizing: "border-box",
									fontFamily: "monospace",
									resize: "vertical",
								}}
							/>
						</div>
						<div
							style={{
								display: "flex",
								justifyContent: "flex-end",
								gap: "12px",
							}}
						>
							<button
								onClick={() => setShowConfigModal(false)}
								style={{
									padding: "10px 16px",
									backgroundColor: "#f8f8f8",
									border: "1px solid #ddd",
									borderRadius: "6px",
									fontSize: "14px",
									cursor: "pointer",
								}}
							>
								Cancel
							</button>
							<button
								onClick={handleConfigSave}
								style={{
									padding: "10px 16px",
									backgroundColor: "#2684ff",
									color: "white",
									border: "none",
									borderRadius: "6px",
									fontSize: "14px",
									cursor: "pointer",
								}}
							>
								Save
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
