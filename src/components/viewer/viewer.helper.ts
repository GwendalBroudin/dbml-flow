import { NodeTypes } from "@/types/nodes.types";
import { Node } from "@xyflow/react";

export function getNodeColor(node: Node) {
  return (node.data.headerColor as string) ?? "#636363ff";
}

export function getNodeClass(node: Node) {
  return node.type === NodeTypes.TableGroup ? "opacity-50" : "";
}
