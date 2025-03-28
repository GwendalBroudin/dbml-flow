import React, { useEffect } from "react";

import useStore, { AppState } from "@/state/store";
import { useShallow } from "zustand/react/shallow";

import { TableNode } from "@/components/table-node";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useOnSelectionChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import RearrangeButton from "../controls/rearrange-button";
import { getNodeColor } from "./viewer.helper";

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onChange: state.onChange,
});

const nodeTypes = {
  table: TableNode,
};

export type FlowProps = {} & React.ComponentProps<typeof ReactFlow>;

function ERViewer({ className, ...props }: FlowProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onChange,
  } = useStore(useShallow(selector));
  const { fitView } = useReactFlow();
  const initialized = useNodesInitialized();

  useOnSelectionChange({ onChange });

  useEffect(() => {
    fitView();
  }, [initialized]);

  return (
    <ReactFlow
      className={className}
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
      <Controls>
        <RearrangeButton />
      </Controls>
      <MiniMap
        nodeColor={getNodeColor}
      />
    </ReactFlow>
  );
}

const Viewer = () => (
  <ReactFlowProvider>
    <ERViewer />
  </ReactFlowProvider>
);

export default Viewer;
