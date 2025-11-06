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
import { useState } from "react";

function Flow() {

  const [activeOutput, setActiveOutput] = useState<any | null>(null);

  const {
    nodes,
    setNodes,
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
    
  } = useWorkflowEngine(nodes, edges, setNodes, setActiveOutput);

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
      {activeOutput && (
        <div className="fixed bottom-0 right-0 bg-white shadow-lg border-t w-[600px] h-[400px] overflow-auto z-50">
          <div className="flex justify-between items-center px-4 py-2 border-b">
            <h3 className="font-semibold text-sm">
              Node Output: {activeOutput.nodeId}
            </h3>
            <button onClick={() => setActiveOutput(null)}>✖</button>
          </div>

          <div className="p-4 text-sm">
            {activeOutput.outputs?.map((op: any, i: number) => (
              <div key={i} className="mb-4">
                <p className="font-semibold">{op.type.toUpperCase()}</p>
                {op.type === "html" ? (
                  <iframe
                    srcDoc={op.content}
                    className="w-full h-60 border rounded"
                  />
                ) : (
                  <pre className="bg-gray-50 border p-2 rounded text-xs overflow-x-auto">
                    {op.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Flow;
