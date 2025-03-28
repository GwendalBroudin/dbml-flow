import Table from "@dbml/core/types/model_structure/table";
import { Node } from "@xyflow/react";

export function getNodeColor(node: Node) {
    if (node.type !== "table") return "#FF5733";
    const table = node.data.table as Table;
    return table.headerColor;
}