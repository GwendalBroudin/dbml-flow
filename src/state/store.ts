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
  NodeDimensionChange,
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
  GroupNodeType,
  NodePositionIndex,
  NodeType,
  NodeTypes,
  SharedNodeData,
  TableNodeType,
} from "@/types/nodes.types";
import Database from "@dbml/core/types/model_structure/database";
import { debounce } from "lodash-es";
import { editor } from "monaco-editor";
import { getNodesBounds } from "@/lib/math/math.helper";
import {
  computeRelatedGroupChanges,
  getBoundedGroups,
} from "@/lib/flow/groups.helpers";
import { toMapId } from "@/lib/utils";
import { CompilerError } from "@dbml/core/types/parse/error";
import { formatDiagnosticsForMonaco } from "@/lib/editor/editor.helper";

// Helper type for parse results
type ParseResult =
  | { success: true; database: Database }
  | { success: false; error: unknown };

export type AppState = {
  // Editor State
  code: string;
  database: Database | null;
  hasTextFocus: boolean;
  editorModel: editor.ITextModel | null;
  globalError: any;
  colorMode: ColorMode;
  savePositionsInCode: boolean;
  saveCodeInUrl: boolean;
  firstRender: boolean;

  // ReactFlow state
  nodes: NodeType[];
  edges: Edge[];
  savedPositions: NodePositionIndex;
  minimap: boolean;
  edgesRelativeData: EdgesRelativeData;
  foldedIds: Set<string>;
  //initialisation
  initState: () => void;

  // Editor Actions
  setCode: (code: string) => void;
  setEditorTextFocus: (focus: boolean) => void;
  setEditorModel: (model: editor.ITextModel | null) => void;
  parseDBML: (code: string) => ParseResult;
  setMarkers: (markers: editor.IMarkerData[]) => void;
  setGlobalError: (error: any) => void;
  clearMarkers: () => void;
  updateViewerFromDatabase: (database: Database) => void;

  // Flow Actions
  setfirstRender: (firstRender: boolean) => void;
  setColorMode: (mode: ColorMode) => void;
  setMinimap: (minimap: boolean) => void;
  onNodesChange: OnNodesChange<NodeType>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onChange: (selected: OnSelectionChangeParams<NodeType, Edge>) => void;
  foldNode: (nodeId: string, fold: boolean) => void;

  setSavedPositions: (nodes: Node[]) => void;
  onLayout: (direction: string, fitView: FitView) => void;
};

const debounceTime = 600;
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
  hasTextFocus: false,
  database: null,
  editorModel: null,
  globalError: null,
  colorMode: "light",
  nodes: [] as NodeType[],
  edges: [] as Edge[],
  savedPositions: {},
  foldedIds: new Set<string>(),
  minimap: false,
  savePositionsInCode: true,
  saveCodeInUrl: true,
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
  setEditorTextFocus: (focus) => set({ hasTextFocus: focus }),
  setCode: (code) => {
    const { saveCodeInUrl } = get();
    if (saveCodeInUrl) setCodeInUrlDebounced(code);
    set({ code });
  },

  parseDBML: (code) => {
    const { clearMarkers, updateViewerFromDatabase, setMarkers } = get();
    set({ globalError: null });
    try {
      const newDB = parser.parse(code, "dbmlv2");
      set({ database: newDB });

      clearMarkers();
      updateViewerFromDatabase(newDB);

      return { success: true, database: newDB };
    } catch (error: any) {
      if ((error as CompilerError)?.diags) {
        const markers = formatDiagnosticsForMonaco(error as CompilerError);
        setMarkers(markers);
      } else {
        console.error("Unknown error:", error);
        set({ globalError: error });
      }
      return { success: false, error };
    }
  },

  updateViewerFromDatabase: (database: Database) => {
    if (!database) return;
    console.log("database", database);

    const { savedPositions: initialSavedPositions, setSavedPositions } = get();

    const oldTableNode = get().nodes.filter((n) => n.type === NodeTypes.Table);
    const oldGroupNodes = get().nodes.filter(
      (n) => n.type === NodeTypes.TableGroup
    );

    // Get initial layout
    let { tableNodes, edges, groupNodes } = parseDatabaseToGraph(database);

    const savedPositions = initialSavedPositions;

    if (
      oldTableNode.length !== tableNodes.length ||
      oldGroupNodes.length !== groupNodes.length
    ) {
      tableNodes = getLayoutedGraph(tableNodes, groupNodes, edges);
    }

    // Preserve existing node positions
    tableNodes = applySavedPositions(tableNodes, savedPositions);

    groupNodes = getBoundedGroups(groupNodes, toMapId(tableNodes));
    set({
      nodes: [...groupNodes, ...tableNodes],
      edges,
    });
    setSavedPositions(tableNodes);
  },

  // Editor markers management
  setGlobalError: (error) => {
    set({ globalError: error });
  },
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

  foldNode: (nodeId: string, fold: boolean) => {
    const { foldedIds, nodes } = get();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      console.warn("Node not found for folding:", nodeId);
      return;
    }

    const newFoldedIds = new Set(foldedIds);
    if (fold) newFoldedIds.add(nodeId);
    else newFoldedIds.delete(nodeId);

    const newNodes = nodes.map((n) => {
      if (n.id === nodeId && "data" in n) {
        return { ...n, data: { ...n.data, folded: fold } };
      }
      return n;
    }) as NodeType[];

    set({ foldedIds: newFoldedIds, nodes: newNodes });
  },

  onNodesChange: (changes: NodeChange<NodeType>[]) => {
    const { nodes } = get();
    const oldNodesById = toMapId<string, NodeType>(nodes);

    const computedChanges = computeRelatedGroupChanges(changes, oldNodesById);

    let newNodes = applyNodeChanges([...changes, ...computedChanges], nodes);

    // Fix: dimension changes seems to not work with applyNodeChanges
    // so we apply them manually here
    if (computedChanges.some((c) => c.type === "dimensions")) {
      newNodes = newNodes.map((n) => {
        const change = computedChanges.find(
          (c) => c.type === "dimensions" && c.id === n.id
        ) as NodeDimensionChange;
        if (!change) return n;
        return {
          ...n,
          width: change.dimensions!.width,
          height: change.dimensions!.height,
        };
      });
    }

    const edgesRelativeData = computeEdgesRelativeData(
      toMapId<string, NodeType>(newNodes),
      get().edges
    );

    get().setSavedPositions(newNodes);
    set({ nodes: newNodes, edgesRelativeData });
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

  onChange: (selected: OnSelectionChangeParams<NodeType, Edge>) => {
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
    const { code, database, savePositionsInCode, setCode, hasTextFocus } =
      get();
    set({ savedPositions });
    if (!hasTextFocus && savePositionsInCode && database) {
      setPositionsInCodeDebounced(code, savedPositions, setCode);
    }
  },
  onLayout: (direction, fitView) => {
    const { nodes, edges } = get();

    const tableNodes = nodes.filter((n) => n.type === NodeTypes.Table);
    const groupNodes = nodes.filter((n) => n.type === NodeTypes.TableGroup);

    const newTableNodes = getLayoutedGraph(tableNodes, groupNodes, edges);

    const newGroupNodes = getBoundedGroups(groupNodes, toMapId(newTableNodes));

    set({
      nodes: [...newGroupNodes, ...newTableNodes],
    });
    get().setSavedPositions(tableNodes);
    setTimeout(() => fitView(), 0);
  },
}));

useStore.getState().initState();

export default useStore;
