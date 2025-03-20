import Ref from "@dbml/core/types/model_structure/ref";
import type Table from "@dbml/core/types/model_structure/table";
import { Edge, type Node } from "@xyflow/react";

export type TableNodeData = {
  label: string;
  table: Table;
  index?: number;
};

export type TableNodeType = Node<TableNodeData, "table">;

export type TableEdgeData = {
  sourcefieldId: string;
  targetfieldId: string;
  ref: Ref;
};

export type TableEdgeType = Edge<TableEdgeData>;  