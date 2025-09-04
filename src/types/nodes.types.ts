import Ref from "@dbml/core/types/model_structure/ref";
import type Table from "@dbml/core/types/model_structure/table";
import { Edge, type Node } from "@xyflow/react";

export type TableNodeData = {
  label: string;
  table: Table;
  index?: number;
  parentId?: string; // group id  
};

export type TableNodeType = Node<TableNodeData, "table">;

export type ERRelationTypes = "oneOptionnal" | "one" | "many";

export type TableEdgeData = {
  sourcefieldId: string;
  targetfieldId: string;
  ref: Ref;
  sourceRelationType: ERRelationTypes;
  targetRelationType: ERRelationTypes;
};

export type TableEdgeType = Edge<TableEdgeData>;

export type NodePositionIndex = {
  [nodeId: string]: [x: number, y: number];
};

export type GroupNodeData = {
  id: string;
  label: string;
  nodeIds: string[];
};

export type GroupNodeType = Node<GroupNodeData, "group">;

export type NodeType = TableNodeType | GroupNodeType;
