import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';


const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: '1',
    position: { x: 0, y: 0 },
    data: { 
      label: 'load-dataset', 
      params: { 
        base_url: 'http://localhost:8080/fhir',
        dash_url: 'http://127.0.0.1:8050',
        processed_data_path: 'processed_data.csv',
        patients_df_path: 'patients_df.csv',
        obs_names_path: 'obs_names.pkl',
        cond_names_path: 'cond_names.pkl',
        dataset_name: '',
      },
      icon: '📥',
      color: '#E6897E',
      type: 'load dataset',
    },
    type: 'custom',
  },
];

const initialEdges = [];

// Node templates available for drag-and-drop
const nodeTemplates = [
  { 
    type: 'custom', 
    label: 'load-dataset', 
    params: { 
      base_url: 'http://localhost:8080/fhir',
      dash_url: 'http://127.0.0.1:8050',
      processed_data_path: 'processed_data.csv',
      patients_df_path: 'patients_df.csv',
      obs_names_path: 'obs_names.pkl',
      cond_names_path: 'cond_names.pkl',
      dataset_name: '',
    },
    icon: '📥',
    color: '#E6897E',
    type: 'load dataset',
  },
];

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [intermediateJson, setIntermediateJson] = useState(null);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const nodeTypeData = event.dataTransfer.getData('application/reactflow');
      if (!nodeTypeData) return;
      
      const nodeTemplate = JSON.parse(nodeTypeData);

      const reactFlowBounds = document.querySelector('.react-flow').getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };

      const uuid = generateUUID();
      const nodeId = `${nodeTemplate.label}-${uuid}`;

      const newNode = {
        id: nodeId,
        type: 'custom',
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
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback(
    (params) => {
      const newEdge = {
        id: `e${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeDataChange = useCallback(
    (id, newData) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === id ? { ...node, data: { ...node.data, ...newData } } : node
        )
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

      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
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
      throw new Error("Can't run the workflow: Multiple root nodes found. The flow should have a single starting point.");
    }

    return rootNodes[0];
  };

  // Level traverse the nodes starting from the root node
  const levelTraverse = (rootId) => {
    const result = [];
    const visited = new Set();
    const queue = [rootId];
    
    // Create a graph representation for easier traversal
    const graph = new Map();
    nodes.forEach(node => graph.set(node.id, new Set()));
    edges.forEach(edge => {
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

  // Create intermediate state (JSON) following the required format
  const createIntermediateState = (nodeIds) => {
    return nodeIds.map(nodeId => {
      const node = nodes.find(n => n.id === nodeId);
      if (!node) return null;

      // Find nodes that depend on this node
      const dependsOn = edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);

      return {
        data: {
          name: node.data.label,
          ...node.data.params
        },
        info: {
          id: nodeId,
          depends: dependsOn,
          type: node.data.type
        }
      };
    }).filter(Boolean);
  };

  
  const handleDeploy = () => {
    try {
      setIntermediateJson(null);
      
      if (nodes.length === 0) {
        throw new Error("Can't run the workflow: No nodes found.");
      }

      // Check for loops
      if (hasLoop()) {
        throw new Error("Can't run the workflow: Loop detected.");
      }

      const rootNode = findRootNode();

      const nodeOrder = levelTraverse(rootNode.id);

      const intermediateState = createIntermediateState(nodeOrder);

      setIntermediateJson(intermediateState);

      console.log('Intermediate State:', JSON.stringify(intermediateState, null, 2));
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      {/* Sidebar for drag-and-drop */}
      <aside style={{ 
        width: '200px', 
        padding: '15px', 
        borderRight: '1px solid #ddd',
        backgroundColor: '#f8f8f8',
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}>
        <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Node Palette</h3>
        
        {nodeTemplates.map((template, index) => (
          <div
            key={index}
            style={{
              padding: '10px',
              backgroundColor: template.color || '#f1f1f1',
              color: '#222',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
              marginBottom: '10px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            onDragStart={(event) => {
              event.dataTransfer.setData('application/reactflow', JSON.stringify(template));
            }}
            draggable
          >
            <span style={{ marginRight: '8px', fontSize: '18px' }}>{template.icon}</span>
            {template.label}
          </div>
        ))}
      </aside>

      {/* React Flow wrapper */}
      <div
        style={{ flex: 1, position: 'relative' }}
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
            style: { stroke: '#555' },
            animated: true,
          }}
        >
          <Background color="#f0f0f0" gap={16} />
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => n.data?.color || '#555'}
            nodeColor={(n) => n.data?.color || '#fff'}
          />
        </ReactFlow>
      </div>

      {/* Parameter editing sidebar */}
      {selectedNode && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: intermediateJson ? '400px' : 0,
          width: '300px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>
              <span style={{ marginRight: '8px' }}>{selectedNode.data.icon}</span>
              {selectedNode.data.label}
            </h3>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer', 
              }}
              onClick={closeSidebar}
            >
              ✕
            </button>
          </div>
          <div style={{ padding: '15px', backgroundColor: '#f8f8f8', borderRadius: '5px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '15px', fontSize: '14px' }}>Node Parameters</h4>
            <form onSubmit={(e) => {
              e.preventDefault();
              closeSidebar();
            }}>
              {Object.entries(selectedNode.data.params).map(([key, value]) => (
                <div key={key} style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}:
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      onNodeDataChange(selectedNode.id, {
                        params: {
                          ...selectedNode.data.params,
                          [key]: e.target.value,
                        },
                      });
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '4px', 
                      border: '1px solid #ddd', 
                    }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={closeSidebar}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intermediate JSON display sidebar */}
      {intermediateJson && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: '#fff',
          boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.1)',
          padding: '20px',
          overflowY: 'auto',
          zIndex: 999,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Workflow JSON</h3>
            <button 
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '18px', 
                cursor: 'pointer', 
              }}
              onClick={() => setIntermediateJson(null)}
            >
              ✕
            </button>
          </div>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '12px',
            lineHeight: 1.5,
          }}>
            {JSON.stringify(intermediateJson, null, 2)}
          </pre>
        </div>
      )}

      {/* Deploy button */}
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: intermediateJson ? '420px' : '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
        }}
        onClick={handleDeploy}
      >
        Deploy
      </button>
    </div>
  );
}

export default App;