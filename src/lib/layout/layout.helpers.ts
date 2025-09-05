import { NodePositionIndex } from "@/types/nodes.types";
import { Node } from "@xyflow/react";

export function toNodeIndex<TNode extends Node>(nodes: TNode[]) {
  return nodes.reduce((acc, node) => {
    acc[node.id] = [node.position.x, node.position.y];
    return acc;
  }, {} as NodePositionIndex);
}

export function applySavedPositions<TNode extends Node>(
  nodes: TNode[],
  savedPositions: NodePositionIndex
) {
  // console.log("applySavedPositions", savedPositions);
  return nodes.map(
    (node) =>
      <TNode>{
        ...node,
        position: {
          x: savedPositions[node.id]?.[0] ?? node.position.x,
          y: savedPositions[node.id]?.[1] ?? node.position.y,
        },
      }
  );
}

