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
}));

export default useStore;
