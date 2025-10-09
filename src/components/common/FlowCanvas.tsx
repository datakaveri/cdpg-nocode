import { ReactFlow, Background, Controls, MiniMap, Node, Edge, OnNodesChange, OnEdgesChange, OnConnect, NodeMouseHandler } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import CustomNode from "../CustomNode";
import { BaseNodeTemplate, CustomNodeData } from "../../types/common.type";

const nodeTypes = { custom: CustomNode };


type FlowCanvasProps = {
  nodes: Node<BaseNodeTemplate>[];
  edges: Edge[];
  onNodesChange: OnNodesChange<Node<BaseNodeTemplate>>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: NodeMouseHandler
  onDrop: (event: React.DragEvent) => void;
  onDragOver: (event: React.DragEvent) => void;
};

export default function FlowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onDrop,
  onDragOver,
}: FlowCanvasProps) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeClick={onNodeClick}
      onDrop={onDrop}
      onDragOver={onDragOver}
      nodeTypes={nodeTypes}
      fitView
    >
      <Background color="#f5f5f5" gap={16} size={1} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
