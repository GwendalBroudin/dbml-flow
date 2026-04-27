import { NodeType, NodeTypes } from "@/types/nodes.types";

export function getNodeColor(node: NodeType) {
  return (node.data.color as string) ?? "#636363ff";
}

export function getNodeClass(node: NodeType) {
  return node.type === NodeTypes.TableGroup ? "opacity-30" : "";
}
