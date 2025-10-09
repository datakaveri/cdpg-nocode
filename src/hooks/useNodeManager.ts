import { useCallback, useEffect, useState } from "react";
import {
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Node,
  Edge,
  Connection,
  OnConnect,
} from "@xyflow/react";
import { toast } from "react-toastify";
import CustomNode from "../components/CustomNode";
import {BaseNodeTemplate, CustomNodeData} from "../types/common.type"

/* --------------------------------------------
 * Types
 * ------------------------------------------*/

export interface NodeParams {
  base_url?: string;
  dataset_name?: string;
  [key: string]: string | undefined; // allow dynamic params for flexibility
}



/* --------------------------------------------
 * Initial Data
 * ------------------------------------------*/

const nodeTypes = { custom: CustomNode };

const initialNodes: Node<BaseNodeTemplate>[] = [
  {
    id: "load-dataset-1",
    position: { x: 250, y: 100 },
    data: {
      label: "load-dataset",
      params: {
        base_url: "https://fhir.rs.adarv.in/fhir",
        dataset_name: "LeptoDemo",
      },
      icon: "database-backup",
      color: "#E6897E",
      type: "load-dataset",
      description: "Load a dataset from FHIR server",
    },
    type: "custom",
  },
];

const initialEdges: Edge[] = [];

/* --------------------------------------------
 * Hook
 * ------------------------------------------*/

export default function useNodeManager() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<CustomNodeData | null>(
    null
  );

  const { screenToFlowPosition } = useReactFlow();

  useEffect(() => {
    if (selectedNode && !nodes.find((n) => n.id === selectedNode.id)) {
      setSelectedNode(null);
    }
  }, [nodes, selectedNode]);

  /* --------------------------------------------
   * Helpers
   * ------------------------------------------*/

  const generateUUID = () =>
    "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  /* --------------------------------------------
   * Handlers
   * ------------------------------------------*/

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const nodeTypeData = event.dataTransfer.getData("application/reactflow");
      if (!nodeTypeData) return;

      const nodeTemplate: BaseNodeTemplate = JSON.parse(nodeTypeData);
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const nodeId = `${nodeTemplate.label}-${generateUUID()}`;

      const newNode: Node<BaseNodeTemplate> = {
        id: nodeId,
        type: "custom",
        position,
        data: nodeTemplate,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, screenToFlowPosition]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        id: `e${params.source}-${params.target}`,
        source: params.source ?? "",
        target: params.target ?? "",
        animated: true,
        style: { stroke: "#555", strokeWidth: 2 },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node as CustomNodeData);
  }, []);

  const deleteNode = useCallback(
    (id: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== id));
      setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
      if (selectedNode?.id === id) setSelectedNode(null);
      toast.info("Node deleted");
    },
    [selectedNode]
  );

  const clearCanvas = useCallback(() => {
    if (window.confirm("Clear the canvas? All nodes will be lost.")) {
      setNodes([]);
      setEdges([]);
      toast.info("Canvas cleared");
    }
  }, [setNodes, setEdges]);

  const onNodeDataChange = useCallback(
    (id: string, newData: Partial<BaseNodeTemplate>) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== id) return node;
          // Merge params properly
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
          // Merge other fields
          return { ...node, data: { ...node.data, ...newData } };
        })
      );
    },
    [setNodes]
  );

  /* --------------------------------------------
   * Return
   * ------------------------------------------*/

  return {
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
    nodeTypes,
  };
}
