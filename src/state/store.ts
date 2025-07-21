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

import { StartupCode } from "@/components/editor/editor.constant";
import {
  extractPositions,
  parseDatabaseToGraph,
  parser,
  setPositionsInCode,
} from "@/lib/dbml/parser";
import {
  computeEdgesRelativeData,
  EdgesRelativeData,
} from "@/lib/flow/edges.helpers";
import { getLayoutedGraph } from "@/lib/layout/dagre.utils";
import { applySavedPositions, toNodeIndex } from "@/lib/layout/layout.helpers";
import { getCodeFromUrl, setCodeInUrl } from "@/lib/url.helpers";
import {
  NodePositionIndex,
  NodeType,
  TableNodeType,
} from "@/types/nodes.types";
import Database from "@dbml/core/types/model_structure/database";
import { debounce } from "lodash-es";
import { editor } from "monaco-editor";

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
  savePositionsInCode: boolean;
  firstRender: boolean;

  // ReactFlow state
  nodes: NodeType[];
  edges: Edge[];
  savedPositions: NodePositionIndex;
  minimap: boolean;
  edgesRelativeData: EdgesRelativeData;
  //initialisation
  initState: () => void;

  // Editor Actions
  setCode: (code: string) => void;
  setEditorModel: (model: editor.ITextModel | null) => void;
  parseDBML: (code: string) => ParseResult;
  setMarkers: (markers: editor.IMarkerData[]) => void;
  clearMarkers: () => void;
  updateViewerFromDatabase: (database: Database) => void;

  // Flow Actions
  setfirstRender: (firstRender: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setMinimap: (minimap: boolean) => void;
  onNodesChange: OnNodesChange<TableNodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: TableNodeType[]) => void;
  setEdges: (edges: Edge[]) => void;
  onChange: (selected: OnSelectionChangeParams<TableNodeType, Edge>) => void;

  setSavedPositions: (nodes: Node[]) => void;
  onLayout: (direction: string, fitView: FitView) => void;
};

const debounceTime = 300;
const setCodeInUrlDebounced = debounce(setCodeInUrl, debounceTime);
const setPositionsInCodeDebounced = debounce(
  (
    code: string,
    savedPositions: NodePositionIndex,
    setCode: (code: string) => void
  ) => {
    const newCode = setPositionsInCode(code, savedPositions);
    setCode(newCode);
  },
  debounceTime
);

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<AppState>((set, get) => ({
  // -------- Initial State --------
  code: "",
  database: null,
  editorModel: null,
  colorMode: "light",
  nodes: [] as TableNodeType[],
  edges: [] as Edge[],
  savedPositions: {},
  minimap: false,
  savePositionsInCode: true,
  firstRender: true,
  edgesRelativeData: {} as EdgesRelativeData,

  initState: () => {
    const code = getCodeFromUrl() || StartupCode;
    set({ code, savedPositions: extractPositions(code) });
    const res = get().parseDBML(code);
    if (!res.success) return;
  },

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
      const { clearMarkers, updateViewerFromDatabase } = get();

      clearMarkers();
      updateViewerFromDatabase(newDB);

      return { success: true, database: newDB };
    } catch (error) {
      return { success: false, error };
    }
  },

  updateViewerFromDatabase: (database: Database) => {
    if (!database) return;
    console.log("database", database);

    const { savedPositions: initialSavedPositions, setSavedPositions } = get();

    // Get initial layout
    let { nodes, edges } = parseDatabaseToGraph(database);

    const savedPositions = initialSavedPositions;

    if (nodes.length !== Object.keys(savedPositions).length) {
      nodes = getLayoutedGraph(nodes, edges);
    }

    // Preserve existing node positions
    nodes = applySavedPositions(nodes, savedPositions);
    set({ nodes, edges });
    setSavedPositions(nodes);
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
  setfirstRender: (firstRender) => set({ firstRender }),
  setMinimap: (minimap) => set({ minimap }),
  setNodes: (nodes: TableNodeType[]) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),

  onNodesChange: (changes: NodeChange<TableNodeType>[]) => {
    const nodes = applyNodeChanges(changes, get().nodes);
    // const edges = getEdgePositions(get().edges, nodes);
    const edgesRelativeData = computeEdgesRelativeData(nodes, get().edges);
    get().setSavedPositions(nodes);
    set({ nodes, edgesRelativeData });
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
  setSavedPositions: (nodes) => {
    const savedPositions = toNodeIndex(nodes);
    const { code, database, savePositionsInCode, setCode } = get();
    set({ savedPositions });
    if (savePositionsInCode && database) {
      setPositionsInCodeDebounced(code, savedPositions, setCode);
    }
  },
  onLayout: (direction, fitView) => {
    const { nodes, edges } = get();
    const newNodes = getLayoutedGraph(nodes, edges);

    set({ nodes: newNodes });
    get().setSavedPositions(newNodes);
    setTimeout(() => fitView(), 0);
  },
}));

useStore.getState().initState();

export default useStore;
