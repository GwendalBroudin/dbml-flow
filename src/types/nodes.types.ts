import type Table from "@dbml/core/types/model_structure/table";
import { type Node } from "@xyflow/react";

export type TableNodeData = {
  label: string;
  table: Table;
  index?: number;
};

export type TableNodeType = Node<TableNodeData, "table">;
