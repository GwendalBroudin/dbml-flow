import React, { useEffect } from "react";

import useStore, { AppState } from "@/state/store";
import { useShallow } from "zustand/react/shallow";

import { TableNode } from "@/components/table-node";
import {
  Background,
  ConnectionMode,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useOnSelectionChange,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import MinimapButton from "../controls/minimap-button";
import RearrangeButton from "../controls/rearrange-button";
import { getNodeColor } from "./viewer.helper";
import HorizontalFloatingEdge, {
  HorizontalFloatingEdgeTypeName,
} from "../edges/horizontal-floating-edge";
import ERMarkers from "../edges/markers";

const selector = (state: AppState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  onChange: state.onChange,
  minimap: state.minimap,
  firstRender: state.firstRender,
  setfirstRender: state.setfirstRender,
});

const nodeTypes = {
  table: TableNode,
};

const edgeTypes = {
  [HorizontalFloatingEdgeTypeName]: HorizontalFloatingEdge,
};

export type FlowProps = {} & React.ComponentProps<typeof ReactFlow>;

export const minZoomLevel = 0.001;

function ERViewer({ className, ...props }: FlowProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onChange,
    minimap,
    firstRender,
    setfirstRender,
  } = useStore(useShallow(selector));
  const { fitView } = useReactFlow();
  const initialized = useNodesInitialized();

  useOnSelectionChange({ onChange });

  // trigger fitview on every code change in the editor
  useEffect(() => {
    console.log("firstRender", firstRender);
    if (firstRender) {
      setTimeout(() => {
        fitView();
        setfirstRender(false);
      }, 0);
    }
  }, [initialized, firstRender, setfirstRender]);

  const map = minimap ? <MiniMap nodeColor={getNodeColor} /> : null;

  return (
    <ReactFlow
      className={className}
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      minZoom={minZoomLevel}
      connectionMode={ConnectionMode.Loose}
    >
      <Background />
      <Controls>
        <RearrangeButton />
        <MinimapButton />
      </Controls>
      {map}
    </ReactFlow>
  );
}

const Viewer = () => (
  <ReactFlowProvider>
    <ERMarkers />
    <ERViewer />
  </ReactFlowProvider>
);

export default Viewer;
