import React from "react";

import useStore, { AppState } from "@/state/store";
import { useShallow } from "zustand/react/shallow";

import { TableNode } from "@/components/table-node";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useOnSelectionChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
});

const nodeTypes = {
  table: TableNode,
};

export type FlowProps = {
  controls?: React.ReactNode;
};

function Flow(props: FlowProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setEdges } = useStore(
    useShallow(selector)
  );

  useOnSelectionChange({
    onChange: (selected) => {
      console.log("Selected elements:", selected);

      if (!selected.nodes.length) {
        return;
      }

      const edgesAnimated = edges.map((edge) => ({
        ...edge,
        animated: selected.nodes.some(n => n.id === edge.source || n.id === edge.target),
      }))
      setEdges(edgesAnimated);
    },
  });

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
