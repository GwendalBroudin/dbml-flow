import {
  Background,
  Controls,
  type Edge,
  type Node,
  NodeProps,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import React, { useEffect } from "react";
import useDagre from "./src/lib/hooks/layout/useDagre";
import { getNodesAndEdges } from "./src/lib/dbml/nodes";
import { TableNodeType } from "./src/types/nodes.types";
import { TableNode } from "./src/components/table-node";
import useHilightEdges from "./src/lib/hooks/useHilightEdges";

const nodeTypes = {
  table: TableNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // const [getNodes, setNodes] = useState<ElkNodeType[]>([]);
  // const [getEdges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    getNodesAndEdges().then((x) => {
      setNodes(x.nodes);
      setEdges(x.edges);
    });
  }, []);

  useHilightEdges(onNodesChange);
  useDagre();

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      edges={edges}
      onEdgesChange={onEdgesChange}
      fitView
      minZoom={0.001}
      nodeTypes={nodeTypes}
      style={{ backgroundColor: "#F7F9FB" }}
    >
      <Background />
      <Controls />
      {/* <MiniMap /> */}
    </ReactFlow>
  );
}

export default () => (
  <ReactFlowProvider>
    <App />
  </ReactFlowProvider>
);
