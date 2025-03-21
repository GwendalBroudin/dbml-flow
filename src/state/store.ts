import { create } from "zustand";
import {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  NodeChange,
  EdgeChange,
  Connection,
  UseOnSelectionChangeOptions,
  OnSelectionChangeParams,
} from "@xyflow/react";

import { TableNodeType } from "@/types/nodes.types";

export type AppState = {
  nodes: TableNodeType[];
  edges: Edge[];
  onNodesChange: OnNodesChange<TableNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: TableNodeType[]) => void;
  setEdges: (edges: Edge[]) => void;
  onChange: (selected: OnSelectionChangeParams<TableNodeType, Edge>) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  nodes: [] as TableNodeType[],
  edges: [] as Edge[],
  onNodesChange: (changes: NodeChange<TableNodeType>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  setNodes: (nodes: TableNodeType[]) => {
    set({ nodes });
  },
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },
  onChange: (selected: OnSelectionChangeParams<TableNodeType, Edge>) => {
    const edgesAnimated = get().edges.map((edge) => ({
      ...edge,
      animated: selected.nodes.some(
        (n) => n.id === edge.source || n.id === edge.target
      ),
    }));

    set({ edges: edgesAnimated });
  },
}));

export default useStore;
