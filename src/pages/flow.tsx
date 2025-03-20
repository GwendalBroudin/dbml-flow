import React from "react";

import useStore, { AppState } from "@/state/store";
import { useShallow } from "zustand/react/shallow";

import "@xyflow/react/dist/style.css";
import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import { TableNode } from "@/components/table-node";

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

const nodeTypes = {
  table: TableNode,
};

export type FlowProps = {
  controls?: React.ReactNode;
};

function Flow(props: FlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector)
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      minZoom={0.001}
    >
      <Background />
      <Controls>{props.controls}</Controls>
      <MiniMap />
    </ReactFlow>
  );
}

export default Flow;
