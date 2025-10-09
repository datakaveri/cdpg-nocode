import { ToastContainer } from "react-toastify";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import FlowCanvas from "./FlowCanvas";

import ParameterSidebar from "../ParameterSidebar";
import DebugConsole from "../DebugConsole"
import ConfigModal from "../ConfigModal"

import useNodeManager from "../../hooks/useNodeManager";
import useWorkflowEngine from "../../hooks/useWorkflowEngine";
import useArgoConfig from "../../hooks/useArgoConfig";

function Flow() {
  const {
    nodes,
    edges,
    onNodesChange,
    onNodeDataChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    onDrop,
    onDragOver,
    selectedNode,
    setSelectedNode,
    deleteNode,
    clearCanvas,
  } = useNodeManager();

  const {
    debugLogs,
    showDebugConsole,
    handleDebugConsole,
    workflowStatus,
    handleDeploy,
    isRunning,
  } = useWorkflowEngine(nodes, edges);

  const {
    showConfigModal,
    handleConfigModal,
    tempConfig,
    setTempConfig,
    handleConfigSave,
  } = useArgoConfig();

  return (
    <div className="relative">
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar
        handleDebugConsole={handleDebugConsole}
        showDebugConsole={showDebugConsole}
      />

      <main className="grid grid-cols-[250px_1fr]">
        <Sidebar
          clearCanvas={clearCanvas}
          handleDeploy={handleDeploy}
          isRunning={isRunning}
        />
        <FlowCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
        />
      </main>

      {selectedNode && (
        <ParameterSidebar
          closeSidebar={() => setSelectedNode(null)}
          selectedNode={selectedNode}
          onNodeDataChange={onNodeDataChange}
        />
      )}

      {showDebugConsole && (
        <DebugConsole
          debugLogs={debugLogs}
          workflowStatus={workflowStatus}
          handleDebugConsole={handleDebugConsole}
        />
      )}

      {showConfigModal && (
        <ConfigModal
          onClose={handleConfigModal}
          tempConfig={tempConfig}
          setTempConfig={setTempConfig}
          onSave={handleConfigSave}
        />
      )}
    </div>
  );
}

export default Flow;
