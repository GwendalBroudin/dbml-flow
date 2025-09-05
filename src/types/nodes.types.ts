import Ref from "@dbml/core/types/model_structure/ref";
import type Table from "@dbml/core/types/model_structure/table";
import { Edge, type Node } from "@xyflow/react";

export type SharedNodeData = {
  label: string;
  color?: string;
};

export type TableNodeData = SharedNodeData & {
  table: Table;
  index?: number;
  parentId?: string; // group id
};

export const NodeTypes = {
  TableGroup: 'TableGroup',
  Table: 'Table',
} as const;

export type NodeTypes = typeof NodeTypes[keyof typeof NodeTypes]; 

export type TableNodeType = Node<TableNodeData, 'Table'>;

export type GroupNodeData = SharedNodeData & {
  nodeIds: string[];
};
export type GroupNodeType = Node<GroupNodeData, 'TableGroup'>;


export type NodeType = TableNodeType | GroupNodeType;

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
