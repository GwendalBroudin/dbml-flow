import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ColorMode,
  Connection,
  Edge,
  EdgeChange,
  FitView,
  Node,
  NodeChange,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  OnSelectionChangeParams,
} from "@xyflow/react";
import { create } from "zustand";

import { parseDatabaseToNodesAndEdges, parser } from "@/lib/dbml/parser";
import {
  getCodeFromUrl,
  getPositionsFromUrl,
  setCodeInUrl,
  setPositionsInUrl,
} from "@/lib/url.helpers";
import { getLayoutedGraph } from "@/lib/layout/dagre.utils";
import {
  applySavedPositions,
  getEdgePositions,
  toNodeIndex,
} from "@/lib/layout/layout.helpers";
import { NodePositionIndex, TableNodeType } from "@/types/nodes.types";
import Database from "@dbml/core/types/model_structure/database";
import { editor } from "monaco-editor";
import { StartupCode } from "@/components/editor/editor.constant";
import { debounce } from "lodash-es";

// Helper type for parse results
type ParseResult =
  | { success: true; database: Database }
  | { success: false; error: unknown };

export type AppState = {
  // Editor State
  code: string;
  database: Database | null;
  editorModel: editor.ITextModel | null;
  colorMode: ColorMode;

  // ReactFlow state
  nodes: TableNodeType[];
  edges: Edge[];
  savedPositions: NodePositionIndex;

  // Editor Actions
  setCode: (code: string) => void;
  setEditorModel: (model: editor.ITextModel | null) => void;
  setColorMode: (mode: ColorMode) => void;
  parseDBML: (code: string) => ParseResult;
  setMarkers: (markers: editor.IMarkerData[]) => void;
  clearMarkers: () => void;
  updateViewerFromDatabase: (database: Database) => void;

  // Flow Actions
  onNodesChange: OnNodesChange<TableNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: TableNodeType[]) => void;
  setEdges: (edges: Edge[]) => void;
  onChange: (selected: OnSelectionChangeParams<TableNodeType, Edge>) => void;

  setSavedPositions: (nodes: Node[]) => void;
  onLayout: (direction: string, fitView: FitView) => void;
};

const initialPositions = getPositionsFromUrl();
const initialCode = getCodeFromUrl() ?? StartupCode;
const initialDatabase = parser.parse(initialCode, "dbmlv2");

const debounceTime = 100; // 1 second
const setCodeInUrlDebounced = debounce(setCodeInUrl, debounceTime);
const setPositionsInUrlDebounced = debounce(setPositionsInUrl, debounceTime);

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  // -------- Initial State --------
  code: initialCode,
  database: initialDatabase,
  editorModel: null,
  colorMode: "light",
  nodes: [] as TableNodeType[],
  edges: [] as Edge[],
  savedPositions: initialPositions,

  // -------- Editor Actions --------
  setEditorModel: (model) => set({ editorModel: model }),
  setColorMode: (mode) => set({ colorMode: mode }),
  setCode: (code) => {
    setCodeInUrlDebounced(code);
    set({ code });
  },

  parseDBML: (code) => {
    try {
      const newDB = parser.parse(code, "dbmlv2");

      set({ database: newDB });
      get().clearMarkers();
      get().updateViewerFromDatabase(newDB);

      return { success: true, database: newDB };
    } catch (error) {
      return { success: false, error };
    }
  },

  updateViewerFromDatabase: (database: Database) => {
    if (!database) return;

    // Get initial layout
    let { nodes, edges } = parseDatabaseToNodesAndEdges(database);
    const savedPositions = get().savedPositions;

    if (nodes.length !== Object.keys(savedPositions).length) {
      nodes = getLayoutedGraph(nodes, edges);
    }

    // Preserve existing node positions
    nodes = applySavedPositions(nodes, savedPositions);
    set({ nodes, edges });
    get().setSavedPositions(nodes);
  },

  // Editor markers management
  setMarkers: (markers) => {
    const { editorModel } = get();
    if (editorModel) {
      editor.setModelMarkers(editorModel, "owner", markers);
    }
  },

  clearMarkers: () => {
    const { editorModel } = get();
    if (editorModel) {
      editor.setModelMarkers(editorModel, "owner", []);
    }
  },

  // -------- Flow Actions --------
  setNodes: (nodes: TableNodeType[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),

  onNodesChange: (changes: NodeChange<TableNodeType>[]) => {
    const nodes = applyNodeChanges(changes, get().nodes);
    const edges = getEdgePositions(get().edges, nodes);
    get().setSavedPositions(nodes);
    set({ nodes, edges });
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
  onChange: (selected: OnSelectionChangeParams<TableNodeType, Edge>) => {
    const edgesAnimated = get().edges.map((edge) => ({
      ...edge,
      animated: selected.nodes.some(
        (n) => n.id === edge.source || n.id === edge.target
      ),
    }));

    set({ edges: edgesAnimated });
  },

  // Layout management

  //Could be a bad idea to debounce this, but it works for now
  setSavedPositions: (nodes) => {
    const savedPositions = toNodeIndex(nodes);
    console.log("setSavedPositions", savedPositions);
    setPositionsInUrlDebounced(savedPositions);
    set({ savedPositions });
  },
  onLayout: (direction, fitView) => {
    console.log("onLayout", direction);
    const { nodes, edges } = get();
    const newNodes = getLayoutedGraph(nodes, edges);

    set({ nodes: newNodes });
    get().setSavedPositions(newNodes);
    setTimeout(() => fitView(), 0);
  },
}));

useStore.getState().updateViewerFromDatabase(initialDatabase);

export default useStore;
