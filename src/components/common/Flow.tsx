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
            {activeOutput && (
              <div className={styles.outputModalBackdrop} onClick={() => setActiveOutput(null)}>
                <div className={styles.outputModal} onClick={(e) => e.stopPropagation()}>
                  <div>
                    <div>Outputs</div>
                    <button onClick={() => setActiveOutput(null)}>×</button>
                  </div>
                  <div>
                    {(activeOutput.initial ? [activeOutput.initial] : activeOutput.outputs).map((out, idx) => (
                      <div key={idx}>
                        {out.type === "csv" ? (
                          <CsvPreview text={out.content} />
                        ) : (
                          <HtmlPreview html={out.content} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CsvPreview({ text, maxRows }) {
  const rows = parseCsv(text);
  if (!rows.length) return <div>No data</div>;
  const header = rows[0];
  const data = typeof maxRows === "number" ? rows.slice(1, 1 + maxRows) : rows.slice(1);
  return (
    <div style={{ overflow: "auto", border: "1px solid #eee", borderRadius: 8 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            {header.map((h, i) => (
              <th key={i} style={{ position: "sticky", top: 0, background: "#fafafa", textAlign: "left", borderBottom: "1px solid #eee", padding: "6px 8px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((r, ri) => (
            <tr key={ri}>
              {header.map((_, ci) => (
                <td key={ci} style={{ borderBottom: "1px solid #f3f3f3", padding: "6px 8px", whiteSpace: "nowrap" }}>{r[ci]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HtmlPreview({ html, height = 500 }) {
  return (
    <iframe
      title="output-plot"
      style={{ width: "100%", height, border: "1px solid #eee", borderRadius: 8 }}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={html}
    />
  );
}


export default Flow;
