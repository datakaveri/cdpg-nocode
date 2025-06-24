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
import styles from "./styles.module.css";

// Icons
import { BsTerminal } from "react-icons/bs";
import { IoMdSettings } from "react-icons/io";
import { nodeTemplates } from "./constants/nodeTemplates";
import { env } from "./environments/environments";
import HeaderActionButton from "./components/HeaderActionButton";
import SidebarMenuItem from "./components/SidebarMenuItem";
import DebugConsole from "./components/DebugConsole";
import ParameterSidebar from "./components/ParameterSidebar";
import ConfigModal from "./components/ConfigModal";
import SidebarButtons from "./components/SidebarButtons";

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
		url: env.argoUrl,
		token: env.argoToken,
	});

	const saveArgoConfig = (config) => {
		setArgoConfig(config);
		// localStorage.setItem("argoConfig", JSON.stringify(config));
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

				console.log(currentStatus);

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

	const handleDebugConsole = () => setShowDebugConsole(!showDebugConsole);

	const handleConfigModal = () => setShowConfigModal(!showConfigModal);

	return (
		<div className={styles.appContainer}>
			<ToastContainer position="top-right" autoClose={3000} />

			{/* Header */}
			<div className={styles.header}>
				<div style={{ display: "flex", alignItems: "center" }}>
					<h1 className={styles.headerTitle}>
						ICMR Workflow Designer
					</h1>
				</div>
				<div className={styles.headerPlaceholder}>
					<HeaderActionButton
						handleDebugConsole={handleDebugConsole}
						showDebugConsole={showDebugConsole}
						icon={<BsTerminal />}
						title="Toggle Debug Console"
					/>
					<HeaderActionButton
						handleDebugConsole={handleConfigModal}
						showDebugConsole={showConfigModal}
						icon={<IoMdSettings />}
						title="Configure Argo"
					/>
				</div>
			</div>

			{/* Sidebar for drag-and-drop */}
			<aside className={styles.sidebar}>
				<h3 className={styles.paletteTitle}>Node Palette</h3>
				<div className={styles.sidebarContainer}>
					{nodeTemplates.map((template, index) => (
						<SidebarMenuItem key={index} template={template} />
					))}
				</div>

				<SidebarButtons
					clearCanvas={clearCanvas}
					handleDeploy={handleDeploy}
					isRunning={isRunning}
				/>
			</aside>

			{/* React Flow wrapper */}
			<div
				className={`${styles.reactflowWrapper} reactflow-wrapper`}
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
					<Controls className={styles.reactflowControls} />
					<MiniMap
						nodeStrokeColor={(n) => n.data?.color || "#555"}
						nodeColor={(n) => n.data?.color || "#fff"}
						maskColor="rgba(240, 240, 240, 0.6)"
						className={styles.reactflowMiniMap}
					/>
				</ReactFlow>
			</div>

			{/* Parameter editing sidebar */}
			{selectedNode && (
				<ParameterSidebar
					closeSidebar={closeSidebar}
					onNodeDataChange={onNodeDataChange}
					selectedNode={nodes.find((n) => n.id === selectedNode.id)}
				/>
			)}

			{/* Debug Console */}
			{showDebugConsole && (
				<DebugConsole
					debugLogs={debugLogs}
					handleDebugConsole={handleDebugConsole}
					selectedNode={selectedNode}
					workflowStatus={workflowStatus}
				/>
			)}

			{/* Config Modal */}
			{showConfigModal && (
				<ConfigModal
					handleConfigModal={handleConfigModal}
					setTempConfig={setTempConfig}
					tempConfig={tempConfig}
					handleConfigSave={handleConfigSave}
				/>
			)}
		</div>
	);
}

export default App;
